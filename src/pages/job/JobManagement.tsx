import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Space, Popconfirm, Input } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import api from "../../api/config"; // <-- dùng axios instance
import type { Job } from "../../types/Job";
import AddJobModal from "../../components/JobModal";

export default function JobManagement() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // 📡 Lấy danh sách công việc
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>("/jobs");
      const result = res.data;

      const filtered = result.filter((j) =>
        j.jobName.toLowerCase().includes(search.toLowerCase())
      );

      setTotal(filtered.length);
      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch (err: unknown) {
      console.error(err);
      message.error("❌ Lỗi khi tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ➕ Thêm job
  const handleAddJob = async (values: Omit<Job, "jobId">) => {
    try {
      await api.post("/jobs", values);
      message.success("Thêm công việc thành công!");
      setIsModalOpen(false);
      fetchJobs();
    } catch (err: unknown) {
      console.error(err);
      message.error("❌ Thêm công việc thất bại");
    }
  };

  // ✏️ Edit job
  const handleEditJob = async (values: Partial<Job>) => {
    if (!editingJob) return;
    try {
      await api.put(`/jobs/${editingJob.jobId}`, values);
      message.success("Cập nhật công việc thành công!");
      setEditingJob(null);
      setIsModalOpen(false);
      fetchJobs();
    } catch (err: unknown) {
      console.error(err);
      message.error("❌ Cập nhật công việc thất bại");
    }
  };

  // 🗑️ Xóa
  const handleDelete = useCallback(
    async (jobId: string) => {
      try {
        await api.delete(`/jobs/${jobId}`);
        message.success("🗑️ Xóa thành công!");
        fetchJobs();
      } catch (err: unknown) {
        console.error(err);
        message.error("❌ Có lỗi khi xóa!");
      }
    },
    [fetchJobs]
  );

  // 📊 Columns
  const columns: ColumnsType<Job> = useMemo(
    () => [
      { title: "Tên công việc", dataIndex: "jobName", key: "jobName", width: 180 },
      { title: "Kỹ năng", dataIndex: "skills", key: "skills", width: 200 },
      { title: "Yêu cầu", dataIndex: "requirement", key: "requirement", width: 200 },
      { title: "Mô tả", dataIndex: "description", key: "description", width: 250 },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_: string, record: Job) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => {
                setEditingJob(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="Xóa công việc này?"
              onConfirm={() => handleDelete(record.jobId)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" icon={<DeleteOutlined className="text-red-500" />} />
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
        <Input
          placeholder="Tìm kiếm theo tên công việc..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
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
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="jobId"
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

      <AddJobModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={(values) =>
          editingJob
            ? handleEditJob(values as Partial<Job>)
            : handleAddJob(values as Omit<Job, "jobId">)
        }
        initialValues={editingJob || undefined}
      />
    </div>
  );
}
