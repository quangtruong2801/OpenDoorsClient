import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Card,
  theme,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "~/api/config";
import type { Recruitment } from "~/types/Recruitment";
import AddRecruitmentModal from "~/components/RecruitmentModal";
import useDebounce from "~/hooks/useDebounce";
import RecruitmentFilter from "~/components/RecruitmentFilter";

export default function RecruitmentManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] =
    useState<Recruitment | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    salary: searchParams.get("salary") || "",
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
  });

  const debouncedSearch = useDebounce(filters.search, 500);
  const pageSizeOptions = ["5", "10", "20", "50", "100"];
  const { token } = theme.useToken();
  const [msgApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Cập nhật URL khi filter thay đổi
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.salary) params.salary = filters.salary;
    params.page = String(filters.page);
    params.pageSize = String(filters.pageSize);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // ✅ Fetch list with TanStack Query v5
  const {
    data = { items: [], total: 0 },
    isPending,
  } = useQuery<{ items: Recruitment[]; total: number }, Error>({
    queryKey: ["recruitments", { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const res = await api.get("/recruitments/filter", {
        params: {
          keyword: debouncedSearch || undefined,
          location: filters.location || undefined,
          salary: filters.salary || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        },
      });
      const { data: items, total } = res.data;
      return {
        items: items.map((r: Recruitment) => ({
          ...r,
          deadline: r.deadline ? new Date(r.deadline) : null,
        })),
        total,
      };
    },
    placeholderData: (prev) => prev, // ✅ Thay thế cho keepPreviousData
    staleTime: 1000 * 30,
    retry: 1,
  });

  // ✅ Add recruitment
  const addMutation = useMutation({
    mutationFn: async (values: Omit<Recruitment, "id">) => {
      await api.post("/recruitments", {
        ...values,
        deadline: values.deadline?.toISOString() || null,
      });
    },
    onSuccess: () => {
      msgApi.success("Thêm tin tuyển dụng thành công!");
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      setIsModalOpen(false);
    },
    onError: () => msgApi.error("Thêm thất bại"),
  });

  // ✅ Edit recruitment
  const editMutation = useMutation({
    mutationFn: async (values: Omit<Recruitment, "id">) => {
      if (!editingRecruitment) return;
      await api.put(`/recruitments/${editingRecruitment.id}`, {
        ...values,
        deadline: values.deadline?.toISOString() || null,
      });
    },
    onSuccess: () => {
      msgApi.success("Cập nhật tin thành công!");
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      setEditingRecruitment(null);
      setIsModalOpen(false);
    },
    onError: () => msgApi.error("Cập nhật thất bại"),
  });

  // ✅ Delete recruitment
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recruitments/${id}`);
    },
    onSuccess: () => {
      msgApi.success("Xóa thành công!");
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
    onError: () => msgApi.error("Xóa thất bại"),
  });

  const columns: ColumnsType<Recruitment> = useMemo(
    () => [
      { title: "Tiêu đề", dataIndex: "title", key: "title", width: 180 },
      { title: "Mức lương", dataIndex: "salary", key: "salary", width: 120 },
      { title: "Địa điểm", dataIndex: "location", key: "location", width: 150 },
      {
        title: "Kinh nghiệm",
        dataIndex: "experience",
        key: "experience",
        width: 120,
      },
      {
        title: "Hạn nộp",
        dataIndex: "deadline",
        key: "deadline",
        width: 120,
        render: (date: Date) =>
          date ? dayjs(date).format("DD/MM/YYYY") : "",
      },
      {
        title: "Mô tả công việc",
        dataIndex: "description",
        key: "description",
        width: 250,
        ellipsis: true,
        render: (desc: string[]) => (
          <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
            {desc?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        ),
      },
      {
        title: "Yêu cầu ứng viên",
        dataIndex: "requirements",
        key: "requirements",
        width: 250,
        ellipsis: true,
        render: (desc: string[]) => (
          <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
            {desc?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        ),
      },
      {
        title: "Quyền lợi",
        dataIndex: "benefits",
        key: "benefits",
        width: 250,
        ellipsis: true,
        render: (desc: string[]) => (
          <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
            {desc?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        ),
      },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined style={{ color: token.colorPrimary }} />}
              onClick={() => {
                setEditingRecruitment(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc muốn xóa tin tuyển dụng "${record.title}"?`}
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, token.colorPrimary]
  );

  return (
    <Card
      title="Quản lý tin tuyển dụng"
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      {contextHolder}

      <div
        style={{
          marginBottom: token.margin,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          width: "100%",
        }}
      >
        <RecruitmentFilter
          filters={filters}
          locations={Array.from(new Set(data.items.map((d) => d.location)))}
          salaries={Array.from(new Set(data.items.map((d) => d.salary)))}
          onChange={(newFilters) =>
            setFilters({ ...filters, ...newFilters, page: 1 })
          }
          onReset={() =>
            setFilters({
              search: "",
              location: "",
              salary: "",
              page: 1,
              pageSize: filters.pageSize,
            })
          }
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRecruitment(null);
            setIsModalOpen(true);
          }}
        >
          Thêm tin tuyển dụng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data.items}
        rowKey="id"
        loading={isPending}
        scroll={{ x: "max-content", y: 600 }}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: data.total,
          showSizeChanger: true,
          pageSizeOptions,
          onChange: (p, ps) => setFilters({ ...filters, page: p, pageSize: ps }),
        }}
      />

      <AddRecruitmentModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecruitment(null);
        }}
        onSubmit={(values) =>
          editingRecruitment
            ? editMutation.mutate(values)
            : addMutation.mutate(values)
        }
        initialValues={editingRecruitment || undefined}
        isEdit={!!editingRecruitment}
      />
    </Card>
  );
}
