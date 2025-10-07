import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Space, Popconfirm, Input } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

import api from "../../api/config";
import type { Job } from "../../types/Job";
import AddJobModal from "../../components/JobModal";

export default function JobManagement() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  //Lấy giá trị từ URL
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 5);
  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Fetch jobs từ server
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>("/jobs");
      const result = res.data;

      // Lọc theo từ khóa
      const filtered = result.filter((j) =>
        j.jobName.toLowerCase().includes(search.toLowerCase())
      );

      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  //Thêm job
  const handleAddJob = async (values: Omit<Job, "jobId">) => {
    try {
      await api.post("/jobs", values);
      message.success("Thêm công việc thành công!");
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      message.error("Thêm công việc thất bại");
    }
  };

  // Sửa job
  const handleEditJob = async (values: Partial<Job>) => {
    if (!editingJob) return;
    try {
      await api.put(`/jobs/${editingJob.jobId}`, values);
      message.success("Cập nhật công việc thành công!");
      setEditingJob(null);
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật công việc thất bại");
    }
  };

  // Xóa job
  const handleDelete = useCallback(
    async (jobId: string) => {
      try {
        await api.delete(`/jobs/${jobId}`);
        message.success("Xóa thành công!");
        fetchJobs();
      } catch (err) {
        console.error(err);
        message.error("Có lỗi khi xóa!");
      }
    },
    [fetchJobs]
  );

  // Cột của bảng
  const columns: ColumnsType<Job> = useMemo(
    () => [
      {
        title: "Tên công việc",
        dataIndex: "jobName",
        key: "jobName",
        width: 180,
      },
      { title: "Kỹ năng", dataIndex: "skills", key: "skills", width: 200 },
      {
        title: "Yêu cầu",
        dataIndex: "requirement",
        key: "requirement",
        width: 200,
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        width: 250,
      },
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
              <Button
                type="text"
                icon={<DeleteOutlined className="text-red-500" />}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete]
  );

  // Cập nhật URL khi người dùng thay đổi search
  const handleSearchChange = (value: string) => {
    setSearchParams({
      search: value,
      page: "1",
      pageSize: pageSize.toString(),
    });
  };

  // Cập nhật URL khi người dùng đổi trang hoặc pageSize
  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setSearchParams({
      search,
      page: newPage.toString(),
      pageSize: newPageSize.toString(),
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Space>
          <Input
            placeholder="Tìm kiếm theo tên công việc..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchParams({
                page: "1",
                pageSize: "5",
              });
            }}
          ></Button>
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
          total: data.length,
          showSizeChanger: true,
          pageSizeOptions,
          onChange: handlePaginationChange,
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
