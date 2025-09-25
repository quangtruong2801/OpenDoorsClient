import { useState, useEffect } from "react";
import { Table, Input, Select, Space } from "antd";

const { Option } = Select;

type Member = {
  id: string;
  avatar: string;
  name: string;
  email: string;
  startDate: string;
  type: string;
  jobType: string;
};

export default function TeamMember() {
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [jobType, setJobType] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // 
  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const params = new URLSearchParams({
  //       search,
  //       type,
  //       jobType,
  //       page: page.toString(),
  //       pageSize: pageSize.toString(),
  //     });
  //     const res = await fetch(`/api/team-members?${params}`);
  //     const json = await res.json();
  //     setData(json.data);
  //     setTotal(json.total);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Mock data
  const allData: Member[] = Array.from({ length: 50 }, (_, i) => ({
    id: (i + 1).toString(),
    avatar: `https://i.pravatar.cc/150?img=${(i % 10) + 1}`,
    name: `User ${(i + 1)}`,
    email: `user${i + 1}@example.com`,
    startDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`,
    type: i % 2 === 0 ? "fulltime" : "parttime",
    jobType: i % 2 === 0 ? "dev" : "design",
  }));

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = allData;

      if (search) {
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (type) {
        filtered = filtered.filter((item) => item.type === type);
      }

      if (jobType) {
        filtered = filtered.filter((item) => item.jobType === jobType);
      }

      setTotal(filtered.length);

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setData(filtered.slice(start, end));

      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, jobType, page, pageSize]);

  const columns = [
    {
      title: "Person",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: Member) => (
        <Space>
          <img
            src={record.avatar}
            className="w-8 h-8 rounded-full"
            alt={record.name}
          />
          {record.name}
        </Space>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Start Date", dataIndex: "startDate", key: "startDate" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Job Type", dataIndex: "jobType", key: "jobType" },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Select Type"
          value={type}
          onChange={(v) => setType(v)}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="fulltime">Full Time</Option>
          <Option value="parttime">Part Time</Option>
        </Select>
        <Select
          placeholder="Select Job Type"
          value={jobType}
          onChange={(v) => setJobType(v)}
          allowClear
          style={{ width: 150 }}
        >
          <Option value="dev">Developer</Option>
          <Option value="design">Designer</Option>
        </Select>
      </div>

      {/* Table */}
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
          pageSizeOptions,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />
    </div>
  );
}
