import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Card,
  message,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import api from "~/api/config";
import type { Job } from "~/types/Job";
import AddJobModal from "~/components/JobModal";
import useDebounce from "~/hooks/useDebounce";

export default function JobManagement() {
  const { t } = useTranslation();
  const [msgApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 5
  );
  const pageSizeOptions = ["5", "10", "20", "50", "100"];
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params: Record<string, string> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };
    if (search) params.search = search;
    setSearchParams(params);
  }, [search, page, pageSize, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", debouncedSearch],
    queryFn: async () => {
      const res = await api.get<Job[]>("/jobs");
      const result = res.data;
      return result.filter((j) =>
        j.jobName.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    },
  });

  const addJob = useMutation({
    mutationFn: (values: Omit<Job, "jobId">) => api.post("/jobs", values),
    onSuccess: () => {
      msgApi.success(t("jobManagement.addSuccess"));
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsModalOpen(false);
    },
    onError: () => msgApi.error(t("jobManagement.addError")),
  });

  const editJob = useMutation({
    mutationFn: (values: Partial<Job>) =>
      api.put(`/jobs/${editingJob?.jobId}`, values),
    onSuccess: () => {
      msgApi.success(t("jobManagement.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setEditingJob(null);
      setIsModalOpen(false);
    },
    onError: () => msgApi.error(t("jobManagement.updateError")),
  });

  const deleteJob = useMutation({
    mutationFn: (jobId: string) => api.delete(`/jobs/${jobId}`),
    onSuccess: () => {
      msgApi.success(t("jobManagement.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => msgApi.error(t("jobManagement.deleteError")),
  });

  const columns: ColumnsType<Job> = useMemo(
    () => [
      { title: t("jobManagement.columns.name"), dataIndex: "jobName", key: "jobName", width: 200 },
      { title: t("jobManagement.columns.skills"), dataIndex: "skills", key: "skills", width: 200 },
      { title: t("jobManagement.columns.requirement"), dataIndex: "requirement", key: "requirement", width: 220 },
      { title: t("jobManagement.columns.description"), dataIndex: "description", key: "description", width: 250 },
      {
        title: t("jobManagement.columns.action"),
        key: "action",
        fixed: "right",
        width: 120,
        render: (_: string, record: Job) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1677ff" }} />}
              onClick={() => {
                setEditingJob(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title={t("jobManagement.confirmDelete", { name: record.jobName })}
              onConfirm={() => deleteJob.mutate(record.jobId)}
              okText={t("jobManagement.delete")}
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteJob, t]
  );

  const handleReset = () => {
    setSearch("");
    setPage(1);
    setPageSize(5);
  };

  return (
    <>
      {contextHolder}
      <Card title={t("jobManagement.title")}>
        <Space
          style={{
            marginBottom: 16,
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Space>
            <Input
              placeholder={t("jobManagement.searchPlaceholder")}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ width: 260 }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              {/* {t("jobManagement.reset")} */}
            </Button>
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
          >
            {t("jobManagement.add")}
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={
            data
              ? data.slice((page - 1) * pageSize, page * pageSize)
              : []
          }
          rowKey="jobId"
          loading={isLoading || addJob.isPending || editJob.isPending}
          scroll={{ x: "max-content", y: 600 }}
          pagination={{
            current: page,
            pageSize,
            total: data?.length || 0,
            showSizeChanger: true,
            pageSizeOptions,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />

        <AddJobModal
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
          onSubmit={(values) =>
            editingJob
              ? editJob.mutate(values as Partial<Job>)
              : addJob.mutate(values as Omit<Job, "jobId">)
          }
          initialValues={editingJob || undefined}
        />
      </Card>
    </>
  );
}
