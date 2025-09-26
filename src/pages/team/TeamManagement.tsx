import { useState, useEffect } from "react";
import { Table, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import AddTeamModal from "../../components/AddTeamModal";
import TeamFilter from "../../components/TeamManagementFilter";
import type { Management } from "../../types/Management";

export default function TeamManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const memberFilter = searchParams.get("memberFilter") || "all";
  const dateFilter = searchParams.get("dateFilter") || "all";

  const [data, setData] = useState<Management[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 300));

    const mockData: Management[] = Array.from({ length: 25 }, (_, i) => ({
      id: (i + 1).toString(),
      teamName: `Team ${i + 1}`,
      members: Math.floor(Math.random() * 15) + 1,
      createdDate: `2023-0${(i % 9) + 1}-15`,
    }));

    let filtered = mockData.filter((d) =>
      d.teamName.toLowerCase().includes(search.toLowerCase())
    );

    // filter members
    filtered = filtered.filter((d) => {
      if (memberFilter === "lt5") return d.members < 5;
      if (memberFilter === "5to10") return d.members >= 5 && d.members <= 10;
      if (memberFilter === "gt10") return d.members > 10;
      return true;
    });

    // filter date
    filtered = filtered.filter((d) => {
      const date = new Date(d.createdDate);
      const now = new Date();
      if (dateFilter === "7d") return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === "30d") return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
      if (dateFilter === "1y") return now.getTime() - date.getTime() <= 365 * 24 * 60 * 60 * 1000;
      return true;
    });

    setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    setTotal(filtered.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [searchParams, page, pageSize]);

  const handleAddTeam = (values: { teamName: string }) => {
    const newTeam: Management = {
      id: Date.now().toString(),
      teamName: values.teamName,
      members: 0,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newTeam, ...prev]);
    setIsModalOpen(false);
  };

  const handleSearchChange = (v: string) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), search: v });
  const handleMemberFilterChange = (v: string) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), memberFilter: v });
  const handleDateFilterChange = (v: string) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), dateFilter: v });

  const columns = [
    { title: "Team Name", dataIndex: "teamName", key: "teamName" },
    { title: "Members", dataIndex: "members", key: "members" },
    { title: "Created Date", dataIndex: "createdDate", key: "createdDate" },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <TeamFilter
          search={search}
          memberFilter={memberFilter}
          dateFilter={dateFilter}
          onSearchChange={handleSearchChange}
          onMemberFilterChange={handleMemberFilterChange}
          onDateFilterChange={handleDateFilterChange}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
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
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <AddTeamModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSubmit={handleAddTeam} />
    </div>
  );
}
