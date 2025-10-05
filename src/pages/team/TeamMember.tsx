
import { useState, useEffect, useMemo } from "react";
import { Table, Space, Button, Popconfirm, message, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import axios from "../../api/config";
import AddMemberModal from "../../components/AddMemberModal";
import MemberFilter from "../../components/MemberFilter";
import type { Member, NewMember } from "../../types/Member";
import type { Management } from "../../types/Management";
import { SOCIAL_OPTIONS } from "../../constants/socials";

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
  const [teamList, setTeamList] = useState<Management[]>([]);
  const [jobList, setJobList] = useState<{ id: string; jobName: string }[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Fetch jobs & teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, teamsRes] = await Promise.all([
          axios.get("/jobs"),
          axios.get("/teams"),
        ]);
        setJobList(jobsRes.data);
        setTeamList(teamsRes.data);
      } catch (err) {
        console.error("❌ Lỗi fetch jobs/teams:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/members");
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter data client-side
  const filteredData = useMemo(() => {
    return data.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = type ? member.type === type : true;
      const matchesJobType = jobType ? member.jobType.includes(jobType) : true;
      const matchesTeam = team
        ? teamList.find((t) => t.id === team)?.teamName === member.team
        : true;
      return matchesSearch && matchesType && matchesJobType && matchesTeam;
    });
  }, [data, search, type, jobType, team, teamList]);

  useEffect(() => {
    setTotal(filteredData.length);
  }, [filteredData]);

  // Handlers filter
  const handleSearchChange = (v: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), search: v });
  const handleTypeChange = (v?: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), type: v || "" });
  const handleJobTypeChange = (v?: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), jobType: v || "" });
  const handleTeamChange = (v?: string) =>
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), team: v || "" });

  // Edit member
  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  // Delete member
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/members/${id}`);
      message.success("🗑️ Xóa thành viên thành công!");
      fetchMembers();
    } catch (err) {
      console.error(err);
      message.error("❌ Có lỗi khi xóa!");
    }
  };

  // Add/Edit member
  const handleSaveMember = async (memberData: NewMember) => {
    try {
      if (editingMember) {
        await axios.put(`/members/${editingMember.id}`, memberData);
        message.success("✅ Cập nhật thành viên thành công!");
      } else {
        await axios.post("/members", memberData);
        message.success("✅ Thêm thành viên thành công!");
      }
      setIsModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      message.error("❌ Có lỗi xảy ra!");
    }
  };

  // Table columns
  const columns: ColumnsType<Member> = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (url: string) => (
        <img
          src={url}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
        />
      ),
    },
    { title: "Họ và tên", dataIndex: "name", key: "name", width: 180 },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    { title: "Ngày sinh", dataIndex: "birthday", key: "birthday", width: 150 },
    { title: "Sở thích", dataIndex: "hobbies", key: "hobbies", width: 200 },
    {
      title: "Mạng xã hội",
      dataIndex: "socials",
      key: "socials",
      width: 220,
      render: (socials: { platform: string; url: string }[]) =>
        socials && socials.length > 0 ? (
          <Space direction="vertical">
            {socials.map((s) => {
              const option = SOCIAL_OPTIONS.find(
                (o) =>
                  o.key.toLowerCase() === s.platform.toLowerCase() ||
                  o.label.toLowerCase() === s.platform.toLowerCase()
              );
              const IconComponent = option?.icon;
              const color = option?.color || "#000";
              return (
                <a
                  key={s.platform + s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  {IconComponent && <IconComponent style={{ color, fontSize: 16 }} />}
                  <span>{s.url}</span>
                </a>
              );
            })}
          </Space>
        ) : (
          "—"
        ),
    },
    { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate", width: 150 },
    { title: "Hình thức", dataIndex: "type", key: "type", width: 150 },
    {
      title: "Công việc",
      dataIndex: "jobType",
      key: "jobType",
      width: 180,
      render: (jobs: string[]) =>
        jobs && jobs.length > 0
          ? jobs.map((job) => (
              <Tag color="blue" key={job}>
                {job}
              </Tag>
            ))
          : "—",
    },
    { title: "Team", dataIndex: "team", key: "team", width: 150 },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
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
            <Button type="text" icon={<DeleteOutlined className="text-red-500" />} />
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
            teamId={team}
            jobList={jobList}
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
          onClick={() => {
            setEditingMember(null);
            setIsModalOpen(true);
          }}
          className="whitespace-nowrap"
        >
          Thêm thành viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
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

      <AddMemberModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleSaveMember}
        initialValues={editingMember || undefined}
        isEdit={!!editingMember}
      />
    </div>
  );
}
