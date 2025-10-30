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
import { useTranslation } from "react-i18next";

import api from "~/api/config";
import type { Recruitment } from "~/types/Recruitment";
import AddRecruitmentModal from "~/components/RecruitmentModal";
import useDebounce from "~/hooks/useDebounce";
import RecruitmentFilter from "~/components/RecruitmentFilter";

export default function RecruitmentManagement() {
  const { t } = useTranslation();
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

  // Fetch list bằng TanStack Query
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
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
    retry: 1,
  });

  // Add recruitment
  const addMutation = useMutation({
    mutationFn: async (values: Omit<Recruitment, "id">) => {
      await api.post("/recruitments", {
        ...values,
        deadline: values.deadline?.toISOString() || null,
      });
    },
    onSuccess: () => {
      msgApi.success(t("recruitmentManagement.addSuccess"));
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      setIsModalOpen(false);
    },
    onError: () => msgApi.error(t("recruitmentManagement.addError")),
  });

  // Edit recruitment
  const editMutation = useMutation({
    mutationFn: async (values: Omit<Recruitment, "id">) => {
      if (!editingRecruitment) return;
      await api.put(`/recruitments/${editingRecruitment.id}`, {
        ...values,
        deadline: values.deadline?.toISOString() || null,
      });
    },
    onSuccess: () => {
      msgApi.success(t("recruitmentManagement.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      setEditingRecruitment(null);
      setIsModalOpen(false);
    },
    onError: () => msgApi.error(t("recruitmentManagement.updateError")),
  });

  // Delete recruitment
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recruitments/${id}`);
    },
    onSuccess: () => {
      msgApi.success(t("recruitmentManagement.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
    },
    onError: () => msgApi.error(t("recruitmentManagement.deleteError")),
  });

  // Cấu hình bảng
  const columns: ColumnsType<Recruitment> = useMemo(
    () => [
      {
        title: t("recruitmentManagement.columns.title"),
        dataIndex: "title",
        key: "title",
        width: 180,
      },
      {
        title: t("recruitmentManagement.columns.salary"),
        dataIndex: "salary",
        key: "salary",
        width: 120,
      },
      {
        title: t("recruitmentManagement.columns.location"),
        dataIndex: "location",
        key: "location",
        width: 150,
      },
      {
        title: t("recruitmentManagement.columns.experience"),
        dataIndex: "experience",
        key: "experience",
        width: 120,
      },
      {
        title: t("recruitmentManagement.columns.deadline"),
        dataIndex: "deadline",
        key: "deadline",
        width: 120,
        render: (date: Date) =>
          date ? dayjs(date).format("DD/MM/YYYY") : "",
      },
      {
        title: t("recruitmentManagement.columns.description"),
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
        title: t("recruitmentManagement.columns.requirements"),
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
        title: t("recruitmentManagement.columns.benefits"),
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
        title: t("recruitmentManagement.columns.action"),
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
              title={t("recruitmentManagement.delete")}
              description={t("recruitmentManagement.confirmDelete", {
                name: record.title,
              })}
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText={t("recruitmentManagement.delete")}
              cancelText={t("recruitmentManagement.reset")}
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, token.colorPrimary, t]
  );

  return (
    <Card
      title={t("recruitmentManagement.title")}
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
          {t("recruitmentManagement.add")}
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
