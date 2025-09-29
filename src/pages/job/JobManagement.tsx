import { useState, useEffect } from "react";
import { Table, Button, message, Space, Popconfirm, Input } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { API_BASE_URL } from "../../api/config";
import type { Job } from "../../types/Job";
import AddJobModal from "../../components/AddJobModal";

export default function JobManagement() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error("Failed to fetch jobs");

      const result: Job[] = await res.json();

      // Lọc theo từ khóa
      const filtered = result.filter((j) =>
        j.jobName.toLowerCase().includes(search.toLowerCase())
      );

      setTotal(filtered.length);
      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi khi tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, page, pageSize]);

  // Thêm Job mới
  const handleAddJob = async (values: Omit<Job, "jobId">) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create job");

      message.success("✅ Thêm công việc thành công!");
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      message.error("❌ Thêm công việc thất bại");
    }
  };

  // Edit
  const handleEdit = (record: Job) =>
    message.info(`✏️ Sửa công việc: ${record.jobName}`);

  // Delete
  const handleDelete = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        message.success("🗑️ Xóa thành công!");
        fetchJobs();
      } else {
        message.error("❌ Xóa thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("❌ Có lỗi khi xóa!");
    }
  };

  const columns = [
    { title: "Tên công việc", dataIndex: "jobName", key: "jobName" },
    { title: "Hình thức", dataIndex: "jobType", key: "jobType" },
    { title: "Kỹ năng", dataIndex: "skills", key: "skills" },
    { title: "Yêu cầu", dataIndex: "requirement", key: "requirement" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Hành động",
      key: "action",
      render: (_: string, record: Job) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa công việc này?"
            onConfirm={() => handleDelete(record.jobId)}
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
          onClick={() => setIsModalOpen(true)}
        >
          Thêm công việc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="jobId"
        loading={loading}
        scroll={{ y: 400 }}
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
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(values) => handleAddJob(values as Omit<Job, "jobId">)} // ✅ ép kiểu
      />
    </div>
  );
}
