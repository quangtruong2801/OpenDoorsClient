import { useState, useEffect } from "react";
import { Table, Space, Button, Popconfirm, message, Form } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import AddMemberModal from "../../components/AddMemberModal";
import MemberFilter from "../../components/MemberFilter";
import type { Member } from "../../types/Member";
import type { Management } from "../../types/Management";

export default function TeamMember() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const jobType = searchParams.get("jobType") || "";
  const team = searchParams.get("team") || "";

  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [teamList, setTeamList] = useState<Management[]>([]);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  const fetchTeamList = async () => {
    const mockTeams: Management[] = Array.from({ length: 10 }, (_, i) => ({
      id: (i + 1).toString(),
      teamName: `Team ${i + 1}`,
      members: Math.floor(Math.random() * 10) + 1,
      createdDate: `2023-0${(i % 9) + 1}-15`,
    }));
    setTeamList(mockTeams);
  };

  const allData: Member[] = Array.from({ length: 50 }, (_, i) => ({
    id: (i + 1).toString(),
    avatar: `https://i.pravatar.cc/150?img=${(i % 10) + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    startDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-15`,
    type: i % 2 === 0 ? "fulltime" : "parttime",
    jobType: i % 2 === 0 ? "dev" : "design",
    team: `Team ${(i % 10) + 1}`,
  }));

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = allData;
      if (search)
        filtered = filtered.filter((d) =>
          d.name.toLowerCase().includes(search.toLowerCase())
        );
      if (type) filtered = filtered.filter((d) => d.type === type);
      if (jobType) filtered = filtered.filter((d) => d.jobType === jobType);
      if (team) filtered = filtered.filter((d) => d.team === team);

      setTotal(filtered.length);
      const start = (page - 1) * pageSize;
      setData(filtered.slice(start, start + pageSize));
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    fetchTeamList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchParams, page, pageSize]);

  const handleSearchChange = (v: string) =>
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      search: v,
    });
  const handleTypeChange = (v: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), type: v });
  const handleJobTypeChange = (v: string) =>
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      jobType: v,
    });
  const handleTeamChange = (v: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), team: v });

  const handleEdit = (record: Member) =>
    message.info(`✏️ Sửa thông tin: ${record.name}`);
  const handleDelete = (id: string) =>
    setData((prev) => prev.filter((d) => d.id !== id));
  const handleAddMember = () => {
    form.validateFields().then((values) => {
      const newMember: Member = {
        id: (Math.random() * 100000).toFixed(0),
        avatar: `https://i.pravatar.cc/150?u=${values.email}`,
        name: values.name,
        email: values.email,
        startDate: new Date().toISOString().split("T")[0],
        type: values.type,
        jobType: values.jobType,
        team: values.team,
      };
      setData((prev) => [newMember, ...prev]);
      setIsModalOpen(false);
      form.resetFields();
      message.success("✅ Thêm thành viên thành công!");
    });
  };

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
    { title: "Team", dataIndex: "team", key: "team" },
    {
      title: "Action",
      key: "action",
      render: (_: string, record: Member) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa thành viên này?"
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
          <MemberFilter
            search={search}
            type={type}
            jobType={jobType}
            team={team}
            teamList={teamList}
            onSearchChange={handleSearchChange}
            onTypeChange={handleTypeChange}
            onJobTypeChange={handleJobTypeChange}
            onTeamChange={handleTeamChange}
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="whitespace-nowrap"
        >
          Thêm thành viên
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

      <AddMemberModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
