import { useState, useEffect, useMemo } from "react";
import { Table, Space, Button, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import { API_BASE_URL } from "../../api/config";
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
  const [teamList, setTeamList] = useState<Management[]>([]);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Fetch danh sách team
  const fetchTeamList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/teams`);
      const result = await res.json();
      setTeamList(result);
    } catch (err) {
      console.error("❌ Lỗi fetch team:", err);
    }
  };

  // Fetch toàn bộ member
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/members`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result: Member[] = await res.json();
      setData(result);
    } catch (err) {
      console.error("❌ Lỗi fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamList();
    fetchMembers();
  }, []);

  // ✅ Filter client-side: search, type, jobType, team
  const filteredData = useMemo(() => {
    return data.filter((member) => {
      const matchesSearch = member.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = type ? member.type === type : true;
      const matchesJobType = jobType ? member.jobType === jobType : true;
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

  // Edit
  const handleEdit = (record: Member) =>
    message.info(`✏️ Sửa thông tin: ${record.name}`);

  // Delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/members/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        message.success("🗑️ Xóa thành viên thành công!");
        fetchMembers();
      } else {
        message.error("❌ Xóa thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("❌ Có lỗi khi xóa!");
    }
  };

  // Add member
  const handleAddMember = async (newMember: Omit<Member, "id">) => {
    try {
      const res = await fetch(`${API_BASE_URL}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      if (res.ok) {
        message.success("✅ Thêm thành viên thành công!");
        setIsModalOpen(false);
        await fetchMembers();
      } else {
        const errorText = await res.text();
        message.error(`❌ Thêm thất bại: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      message.error("❌ Có lỗi xảy ra khi thêm thành viên!");
    }
  };

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
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
          }}
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
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 150,
    },
    { title: "Hình thức", dataIndex: "type", key: "type", width: 150 },
    { title: "Công việc", dataIndex: "jobType", key: "jobType", width: 180 },
    { title: "Team", dataIndex: "team", key: "team", width: 150 },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right", // ✅ Đúng kiểu
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
            teamId={team}
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
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
