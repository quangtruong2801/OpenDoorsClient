import { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import AddTeamModal from "../../components/AddTeamModal";
import TeamFilter from "../../components/TeamManagementFilter"; // đảm bảo TeamFilter đã bỏ dateFilter
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

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");

      const result: Management[] = await res.json();

      // Lọc theo search
      let filtered = result.filter((d) =>
        d.teamName.toLowerCase().includes(search.toLowerCase())
      );

      // Lọc theo số lượng member
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
  };

  useEffect(() => {
    fetchData();
  }, [searchParams, page, pageSize]);

  // Thêm team mới
  const handleAddTeam = async (values: { teamName: string }) => {
    try {
      const res = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create team");

      message.success("✅ Thêm team thành công!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("❌ Thêm team thất bại");
    }
  };

  const handleSearchChange = (v: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), search: v });
  const handleMemberFilterChange = (v: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), memberFilter: v });

  const columns = [
    { title: "Team Name", dataIndex: "teamName", key: "teamName" },
    { title: "Members", dataIndex: "members", key: "members" },
    // { title: "Created Date", dataIndex: "createdDate", key: "createdDate" },
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
          onClick={() => setIsModalOpen(true)}
        >
          Thêm Team
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ y: 400 }}
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
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAddTeam}
      />
    </div>
  );
}
