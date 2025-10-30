import { useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Select,
  theme,
  Typography,
  Space,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import axios from "~/api/config";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Application } from "~/types/Application";

const { Title } = Typography;

export default function ApplicationManagement() {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
  });

  const {
    token: { colorBgContainer, colorText, colorBorderSecondary },
  } = theme.useToken();

  const [msgApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Fetch dữ liệu bằng React Query
  const { data, isPending } = useQuery<Application[], Error>({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await axios.get("/applications");
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });

  // Xóa hồ sơ
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      msgApi.success(t("applicationManagement.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => msgApi.error(t("applicationManagement.deleteError")),
  });

  // Đổi trạng thái
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await axios.put(`/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      msgApi.success(t("applicationManagement.updateStatusSuccess"));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => msgApi.error(t("applicationManagement.updateStatusError")),
  });

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination(pag);
  };

  const columns: ColumnsType<Application> = [
    {
      title: t("applicationManagement.columns.name"),
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: t("applicationManagement.columns.email"),
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: t("applicationManagement.columns.phone"),
      dataIndex: "phone",
      key: "phone",
      width: 140,
    },
    {
      title: t("applicationManagement.columns.position"),
      dataIndex: "position",
      key: "position",
      width: 180,
    },
    {
      title: t("applicationManagement.columns.resume"),
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      width: 150,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {t("applicationManagement.viewResume")}
        </a>
      ),
    },
    {
      title: t("applicationManagement.columns.status"),
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(val) => statusMutation.mutate({ id: record.id, status: val })}
          style={{ width: 120 }}
          options={[
            { value: "pending", label: t("applicationManagement.status.pending") },
            { value: "reviewed", label: t("applicationManagement.status.reviewed") },
            { value: "accepted", label: t("applicationManagement.status.accepted") },
            { value: "rejected", label: t("applicationManagement.status.rejected") },
          ]}
        />
      ),
    },
    {
      title: t("applicationManagement.columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: t("applicationManagement.columns.action"),
      key: "action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title={t("applicationManagement.confirmDeleteTitle")}
          description={t("applicationManagement.confirmDeleteDesc", {
            name: record.name,
          })}
          okText={t("applicationManagement.delete")}
          cancelText={t("applicationManagement.cancel")}
          onConfirm={() => deleteMutation.mutate(record.id)}
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div
      style={{
        background: colorBgContainer,
        color: colorText,
        border: `1px solid ${colorBorderSecondary}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      {contextHolder}

      <Space direction="vertical" style={{ width: "100%" }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          {t("applicationManagement.title")}
        </Title>

        <Table
          columns={columns}
          dataSource={data || []}
          rowKey="id"
          loading={isPending}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Space>
    </div>
  );
}
