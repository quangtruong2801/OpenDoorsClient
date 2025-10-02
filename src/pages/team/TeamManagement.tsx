import { useState, useEffect, useCallback } from "react";
import { Table, Button, message, Space, Popconfirm } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import { API_BASE_URL } from "../../api/config";
import AddTeamModal from "../../components/AddTeamModal";
import TeamFilter from "../../components/TeamManagementFilter";
import type { Management } from "../../types/Management";

export default function TeamManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const memberFilter = searchParams.get("memberFilter") || "all";

  const [data, setData] = useState<Management[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Management | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // 🔄 Fetch danh sách team
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teams`);
      if (!res.ok) throw new Error("Failed to fetch teams");

      const result: Management[] = await res.json();

      // Lọc search
      let filtered = result.filter((d) =>
        d.teamName.toLowerCase().includes(search.toLowerCase())
      );

      // Lọc số lượng member
      filtered = filtered.filter((d) => {
        if (memberFilter === "lt5") return d.members < 5;
        if (memberFilter === "5to10") return d.members >= 5 && d.members <= 10;
        if (memberFilter === "gt10") return d.members > 10;
        return true;
      });

      setTotal(filtered.length);
      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi khi tải danh sách team");
    } finally {
      setLoading(false);
    }
  }, [search, memberFilter, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ➕ Thêm / ✏️ Sửa team
  const handleSaveTeam = async (values: { teamName: string }) => {
    try {
      if (editingTeam) {
        // ✏️ Sửa team
        const res = await fetch(`${API_BASE_URL}/teams/${editingTeam.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) throw new Error("Failed to update team");

        message.success("Cập nhật team thành công!");
      } else {
        // ➕ Thêm team mới
        const res = await fetch(`${API_BASE_URL}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!res.ok) throw new Error("Failed to create team");

        message.success("Thêm team thành công!");
      }

      setIsModalOpen(false);
      setEditingTeam(null);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("❌ Lưu team thất bại");
    }
  };

  // ✏️ Edit team
  const handleEdit = (record: Management) => {
    setEditingTeam(record);
    setIsModalOpen(true);
  };

  // 🗑️ Delete team
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        message.success("🗑️ Xóa thành công!");
        fetchData();
      } else {
        message.error("❌ Xóa thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("❌ Có lỗi khi xóa!");
    }
  };

  // 🔍 Handlers filter
  const handleSearchChange = (v: string) =>
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      search: v,
    });

  const handleMemberFilterChange = (v: string) =>
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      memberFilter: v,
    });

  // 📊 Cột bảng
  const columns: ColumnsType<Management> = [
    { title: "Team Name", dataIndex: "teamName", key: "teamName", width: 200 },
    { title: "Members", dataIndex: "members", key: "members", width: 150 },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_: string, record: Management) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa team này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              icon={<DeleteOutlined className="text-red-500" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex-1 min-w-[300px]">
          <TeamFilter
            search={search}
            memberFilter={memberFilter}
            onSearchChange={handleSearchChange}
            onMemberFilterChange={handleMemberFilterChange}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTeam(null);
            setIsModalOpen(true);
          }}
        >
          Thêm Team
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content", y: 600 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <AddTeamModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingTeam(null);
        }}
        onSubmit={handleSaveTeam}
        initialValues={editingTeam || undefined}
        isEdit={!!editingTeam}
      />
    </div>
  );
}
