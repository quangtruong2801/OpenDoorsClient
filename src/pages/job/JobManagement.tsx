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

import api from "~/api/config";
import type { Job } from "~/types/Job";
import AddJobModal from "~/components/JobModal";
import useDebounce from "~/hooks/useDebounce";

export default function JobManagement() {
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

  // Cập nhật URL khi search / page thay đổi
  useEffect(() => {
    const params: Record<string, string> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };
    if (search) params.search = search;
    setSearchParams(params);
  }, [search, page, pageSize, setSearchParams]);

  // Fetch danh sách công việc
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

  // Mutation: Thêm công việc
  const addJob = useMutation({
    mutationFn: (values: Omit<Job, "jobId">) => api.post("/jobs", values),
    onSuccess: () => {
      msgApi.success("Thêm công việc thành công!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsModalOpen(false);
    },
    onError: () => msgApi.error("Thêm công việc thất bại"),
  });

  // Mutation: Sửa công việc
  const editJob = useMutation({
    mutationFn: (values: Partial<Job>) =>
      api.put(`/jobs/${editingJob?.jobId}`, values),
    onSuccess: () => {
      msgApi.success("Cập nhật công việc thành công!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setEditingJob(null);
      setIsModalOpen(false);
    },
    onError: () => msgApi.error("Cập nhật công việc thất bại"),
  });

  // Mutation: Xóa công việc
  const deleteJob = useMutation({
    mutationFn: (jobId: string) => api.delete(`/jobs/${jobId}`),
    onSuccess: () => {
      msgApi.success("Xóa công việc thành công!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => msgApi.error("Có lỗi khi xóa!"),
  });

  const columns: ColumnsType<Job> = useMemo(
    () => [
      { title: "Tên công việc", dataIndex: "jobName", key: "jobName", width: 200 },
      { title: "Kỹ năng", dataIndex: "skills", key: "skills", width: 200 },
      { title: "Yêu cầu", dataIndex: "requirement", key: "requirement", width: 220 },
      { title: "Mô tả", dataIndex: "description", key: "description", width: 250 },
      {
        title: "Hành động",
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
              title={`Bạn có chắc muốn xóa công việc "${record.jobName}"?`}
              onConfirm={() => deleteJob.mutate(record.jobId)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteJob]
  );

  const handleReset = () => {
    setSearch("");
    setPage(1);
    setPageSize(5);
  };

  return (
    <>
      {contextHolder}
      <Card title="Quản lý công việc">
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
              placeholder="Tìm kiếm công việc..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ width: 260 }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleReset} />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
          >
            Thêm công việc
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
