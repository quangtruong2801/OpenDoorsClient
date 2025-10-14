import { useState, useEffect, useCallback } from "react";
import { Table, Button, message, Space, Popconfirm, Card } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import axios from "../../api/config";
import AddTeamModal from "../../components/TeamModal";
import TeamFilter from "../../components/TeamManagementFilter";
import type { Management } from "../../types/Management";
import useDebounce from "../../hooks/useDebounce";

export default function TeamManagement() {
  const [msgApi, contextHolder] = message.useMessage();

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    memberFilter: searchParams.get("memberFilter") || "all",
  });

  const debouncedFilters = useDebounce(filters, 500);

  const [data, setData] = useState<Management[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Management | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Fetch danh sách team
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<Management[]>("/teams");
      const result = res.data;

      let filtered = result.filter((d) =>
        d.teamName.toLowerCase().includes(debouncedFilters.search.toLowerCase())
      );

      filtered = filtered.filter((d) => {
        if (debouncedFilters.memberFilter === "lt5") return d.members < 5;
        if (debouncedFilters.memberFilter === "5to10")
          return d.members >= 5 && d.members <= 10;
        if (debouncedFilters.memberFilter === "gt10") return d.members > 10;
        return true;
      });

      setTotal(filtered.length);
      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch (err) {
      console.error(err);
      msgApi.error("Lỗi khi tải danh sách team");
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, page, pageSize, msgApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (
    key: "search" | "memberFilter",
    value: string
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setSearchParams(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const reset = { search: "", memberFilter: "all" };
    setFilters(reset);
    setSearchParams({});
    setPage(1);
  };

  const handleSaveTeam = async (values: { teamName: string }) => {
    try {
      if (editingTeam) {
        await axios.put(`/teams/${editingTeam.id}`, values);
        msgApi.success("Cập nhật team thành công!");
      } else {
        await axios.post("/teams", values);
        msgApi.success("Thêm team thành công!");
      }
      setIsModalOpen(false);
      setEditingTeam(null);
      fetchData();
    } catch (err) {
      console.error(err);
      msgApi.error("Lưu team thất bại");
    }
  };

  const handleEdit = (record: Management) => {
    setEditingTeam(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/teams/${id}`);
      msgApi.success("Xóa thành công!");
      fetchData();
    } catch (err) {
      console.error(err);
      msgApi.error("Có lỗi khi xóa!");
    }
  };

  const columns: ColumnsType<Management> = [
    { title: "Tên Team", dataIndex: "teamName", key: "teamName", width: 250 },
    { title: "Số thành viên", dataIndex: "members", key: "members", width: 150 },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#1677ff" }} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa team này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder} {/* ✅ cần render contextHolder */}
      <Card title="Quản lý Team" variant="borderless">
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Space>
            <TeamFilter
              search={filters.search}
              memberFilter={filters.memberFilter}
              onSearchChange={(v) => handleFilterChange("search", v)}
              onMemberFilterChange={(v) =>
                handleFilterChange("memberFilter", v)
              }
            />
            <Button icon={<ReloadOutlined />} onClick={handleResetFilters} />
          </Space>

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
        </Space>

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
      </Card>
    </>
  );
}
