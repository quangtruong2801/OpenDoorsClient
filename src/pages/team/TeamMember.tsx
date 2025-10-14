import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Space,
  Button,
  Popconfirm,
  message,
  Tag,
  Card,
  theme,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import useDebounce from "../../hooks/useDebounce";

import axios from "../../api/config";
import AddMemberModal from "../../components/MemberModal";
import MemberFilter from "../../components/MemberFilter";

import type { Member, NewMember } from "../../types/Member";
import type { Management } from "../../types/Management";
import { SOCIAL_OPTIONS } from "../../constants/socials";

export default function TeamMember() {
  const { token } = theme.useToken(); // Lấy màu từ theme antd
  const [msgApi, contextHolder] = message.useMessage();

  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    jobType: searchParams.get("jobType") || "",
    teamId: searchParams.get("teamId") || "",
  });

  const debouncedFilters = useDebounce(filters, 500);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize")) || 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [jobList, setJobList] = useState<{ id: string; jobName: string }[]>([]);
  const [teamList, setTeamList] = useState<Management[]>([]);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Sync URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.teamId) params.teamId = filters.teamId;
    params.page = String(page);
    params.pageSize = String(pageSize);
    setSearchParams(params);
  }, [filters, page, pageSize, setSearchParams]);

  // Fetch job & team list
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [jobsRes, teamsRes] = await Promise.all([
          axios.get("/jobs"),
          axios.get("/teams"),
        ]);
        setJobList(jobsRes.data);
        setTeamList(teamsRes.data);
      } catch {
        msgApi.error("Không tải được danh sách công việc hoặc team!");
      }
    };
    fetchMeta();
  }, [msgApi]);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/members/filter", {
        params: {
          search: debouncedFilters.search || undefined,
          type: debouncedFilters.type || undefined,
          jobType: debouncedFilters.jobType || undefined,
          teamId: debouncedFilters.teamId || undefined,
          page,
          pageSize,
        },
      });
      const { data: items, total } = res.data;
      setData(items);
      setTotal(total);
    } catch {
      msgApi.error("Lỗi tải danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, page, pageSize, msgApi]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // CRUD handlers
  const handleAddMember = async (values: NewMember) => {
    try {
      await axios.post("/members", values);
      msgApi.success("Thêm thành viên thành công!");
      setIsModalOpen(false);
      fetchMembers();
    } catch {
      msgApi.error("Thêm thất bại");
    }
  };

  const handleEditMember = async (values: NewMember) => {
    if (!editingMember) return;
    try {
      await axios.put(`/members/${editingMember.id}`, values);
      msgApi.success("Cập nhật thành viên thành công!");
      setIsModalOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch {
      msgApi.error("Cập nhật thất bại");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/members/${id}`);
        msgApi.success("Xóa thành viên thành công!");
        fetchMembers();
      } catch {
        msgApi.error("Xóa thất bại");
      }
    },
    [fetchMembers, msgApi]
  );

  // Cấu hình cột
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
      {
        title: "Sở thích",
        dataIndex: "hobbies",
        key: "hobbies",
        width: 220,
        ellipsis: true,
        render: (desc: string[]) =>
          desc?.length ? (
            <ul style={{ listStyleType: "none", margin: 0, paddingLeft: 16 }}>
              {desc.map((item, idx) => (
                <li key={idx}>- {item}</li>
              ))}
            </ul>
          ) : (
            "—"
          ),
      },
      {
        title: "Mạng xã hội",
        dataIndex: "socials",
        key: "socials",
        width: 220,
        render: (socials: { platform: string; url: string }[]) =>
          socials?.length ? (
            <Space direction="vertical">
              {socials.map((s) => {
                const option = SOCIAL_OPTIONS.find(
                  (o) =>
                    o.key.toLowerCase() === s.platform.toLowerCase() ||
                    o.label.toLowerCase() === s.platform.toLowerCase()
                );
                const IconComponent = option?.icon;
                const color = option?.color || token.colorText;
                return (
                  <a
                    key={s.platform + s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color,
                    }}
                  >
                    {IconComponent && (
                      <IconComponent style={{ color, fontSize: 16 }} />
                    )}
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
          jobs?.length
            ? jobs.map((job) => (
                <Tag color="blue" key={job}>
                  {job}
                </Tag>
              ))
            : "—",
      },
      { title: "Team", dataIndex: "team", key: "team", width: 150 },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_, record: Member) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingMember(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="Xóa thành viên này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, token.colorText]
  );

  return (
    <>
      {contextHolder} {/* ✅ cần render contextHolder */}
      <Card
        title="Quản lý thành viên"
        variant="borderless"
        style={{
          background: token.colorBgContainer,
          color: token.colorText,
          boxShadow: token.boxShadow,
        }}
      >
        <Space
          direction="horizontal"
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <MemberFilter
            filters={filters}
            jobList={jobList}
            teamList={teamList}
            onChange={(newFilters) => {
              setFilters((prev) => ({ ...prev, ...newFilters }));
              setPage(1);
            }}
            onReset={() => {
              setFilters({ search: "", type: "", jobType: "", teamId: "" });
              setPage(1);
            }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingMember(null);
              setIsModalOpen(true);
            }}
          >
            Thêm thành viên
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

        <AddMemberModal
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingMember(null);
          }}
          onSubmit={editingMember ? handleEditMember : handleAddMember}
          initialValues={editingMember || undefined}
          isEdit={!!editingMember}
        />
      </Card>
    </>
  );
}
