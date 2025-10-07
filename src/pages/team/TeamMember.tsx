import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Space, Button, Popconfirm, message, Tag, Input, Select } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import axios from "../../api/config";
import AddMemberModal from "../../components/MemberModal";
import type { Member, NewMember } from "../../types/Member";
import type { Management } from "../../types/Management";
import { SOCIAL_OPTIONS } from "../../constants/socials";

// Hook debounce
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const { Option } = Select;

export default function TeamMember() {
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [jobFilter, setJobFilter] = useState(searchParams.get("jobType") || "");
  const [teamFilter, setTeamFilter] = useState(searchParams.get("team") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || 10);

  const debouncedSearch = useDebounce(search, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [jobList, setJobList] = useState<{ id: string; jobName: string }[]>([]);
  const [teamList, setTeamList] = useState<Management[]>([]);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // URL sync
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (jobFilter) params.jobType = jobFilter;
    if (teamFilter) params.team = teamFilter;
    params.page = String(page);
    params.pageSize = String(pageSize);
    setSearchParams(params);
  }, [search, typeFilter, jobFilter, teamFilter, page, pageSize, setSearchParams]);

  // Fetch job & team list
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [jobsRes, teamsRes] = await Promise.all([axios.get("/jobs"), axios.get("/teams")]);
        setJobList(jobsRes.data);
        setTeamList(teamsRes.data);
      } catch (err) {
        console.error(err);
        message.error("Không tải được danh sách công việc hoặc team!");
      }
    };
    fetchMeta();
  }, []);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/members/filter", {
        params: {
          search: debouncedSearch || undefined,
          type: typeFilter || undefined,
          jobType: jobFilter || undefined,
          team: teamFilter || undefined,
          page,
          pageSize,
        },
      });

      const { data: items, total } = res.data;
      setData(items);
      setTotal(total);
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, jobFilter, teamFilter, page, pageSize]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handlers
  const handleAddMember = async (values: NewMember) => {
    try {
      await axios.post("/members", values);
      message.success("Thêm thành viên thành công!");
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      console.error(err);
      message.error("Thêm thất bại");
    }
  };

  const handleEditMember = async (values: NewMember) => {
    if (!editingMember) return;
    try {
      await axios.put(`/members/${editingMember.id}`, values);
      message.success("Cập nhật thành viên thành công!");
      setIsModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/members/${id}`);
        message.success("Xóa thành viên thành công!");
        fetchMembers();
      } catch (err) {
        console.error(err);
        message.error("Xóa thất bại");
      }
    },
    [fetchMembers]
  );

  const columns: ColumnsType<Member> = useMemo(
    () => [
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
        render: (jobs: string[]) => (jobs && jobs.length > 0 ? jobs.map((job) => <Tag color="blue" key={job}>{job}</Tag>) : "—"),
      },
      { title: "Team", dataIndex: "team", key: "team", width: 150 },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_: string, record: Member) => (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingMember(record); setIsModalOpen(true); }} />
            <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)}>
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete]
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Space wrap>
          <Input
            placeholder="Tìm theo tên"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Chọn hình thức"
            value={typeFilter || undefined}
            onChange={(v) => { setTypeFilter(v || ""); setPage(1); }}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="fulltime">Full Time</Option>
            <Option value="parttime">Part Time</Option>
            <Option value="intern">Intern</Option>
          </Select>
          <Select
            placeholder="Chọn công việc"
            value={jobFilter || undefined}
            onChange={(v) => { setJobFilter(v || ""); setPage(1); }}
            allowClear
            style={{ width: 160 }}
          >
            {jobList.map((j) => (
              <Option key={j.id} value={j.jobName}>{j.jobName}</Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn team"
            value={teamFilter || undefined}
            onChange={(v) => { setTeamFilter(v || ""); setPage(1); }}
            allowClear
            style={{ width: 160 }}
          >
            {teamList.map((t) => (
              <Option key={t.id} value={t.id}>{t.teamName}</Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(""); setTypeFilter(""); setJobFilter(""); setTeamFilter(""); setPage(1); }} />
        </Space>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingMember(null); setIsModalOpen(true); }}>
          Thêm thành viên
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <AddMemberModal
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingMember(null); }}
        onSubmit={editingMember ? handleEditMember : handleAddMember}
        initialValues={editingMember || undefined}
        isEdit={!!editingMember}
      />
    </div>
  );
}
