import { useState, useEffect } from "react";
import { Table, Input, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";

type Management = {
  id: string;
  teamName: string;
  lead: string;
  members: number;
  createdDate: string;
};

export default function TeamManagement() {
  const [data, setData] = useState<Management[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

   // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const params = new URLSearchParams({
  //       search,
  //       page: page.toString(),
  //       pageSize: pageSize.toString(),
  //     });
  //     const res = await fetch(`/api/team-management?${params}`);
  //     const json = await res.json();
  //     setData(json.data);
  //     setTotal(json.total);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500)); // API delay
      const mockData: Management[] = Array.from({ length: 25 }, (_, i) => ({
        id: (i + 1).toString(),
        teamName: `Team ${i + 1}`,
        lead: `Lead ${i + 1}`,
        members: Math.floor(Math.random() * 10) + 1,
        createdDate: `2023-0${(i % 9) + 1}-15`,
      }));

      const filtered = mockData.filter((item) =>
        item.teamName.toLowerCase().includes(search.toLowerCase())
      );

      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
      setTotal(filtered.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, pageSize]);

  const columns: ColumnsType<Management> = [
    { title: "Team Name", dataIndex: "teamName", key: "teamName" },
    { title: "Team Lead", dataIndex: "lead", key: "lead" },
    { title: "Members", dataIndex: "members", key: "members" },
    { title: "Created Date", dataIndex: "createdDate", key: "createdDate" },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by team name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Button onClick={() => fetchData()}>Refresh</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: pageSizeOptions,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />
    </div>
  );
}
