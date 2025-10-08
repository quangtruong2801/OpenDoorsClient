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
import useDebounce from "../../hooks/useDebounce";

export default function JobManagement() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // State gốc cho tìm kiếm và phân trang
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 5
  );
  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Debounce để tránh gọi API liên tục khi gõ chữ
  const debouncedSearch = useDebounce(search, 500);

  // Cập nhật URL mỗi khi search hoặc phân trang thay đổi
  useEffect(() => {
    const params: Record<string, string> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };
    if (search) params.search = search;
    setSearchParams(params);
  }, [search, page, pageSize, setSearchParams]);

  // Fetch jobs từ server với filter & debounce
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>("/jobs");
      const result = res.data;

      // Lọc theo từ khóa debounce
      const filtered = result.filter((j) =>
        j.jobName.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

      setData(filtered);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, page, pageSize]);

  // Thêm job
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
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete]
  );

  // Reset search
  const handleReset = () => {
    setSearch("");
    setPage(1);
    setPageSize(5);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Space>
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
      </div>

      <Table
        columns={columns}
        dataSource={data.slice((page - 1) * pageSize, page * pageSize)} // ✅ phân trang sau khi lọc
        rowKey="jobId"
        loading={loading}
        scroll={{ x: "max-content", y: 600 }}
        pagination={{
          current: page,
          pageSize,
          total: data.length,
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
