import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  App,
  theme,
  Card,
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
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 5
  );
  const pageSizeOptions = ["5", "10", "20", "50", "100"];
  const debouncedSearch = useDebounce(search, 500);

  const { message } = App.useApp();
  const { token } = theme.useToken();

  // Cập nhật URL khi search / page thay đổi
  useEffect(() => {
    const params: Record<string, string> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };
    if (search) params.search = search;
    setSearchParams(params);
  }, [search, page, pageSize, setSearchParams]);

  // Fetch dữ liệu
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>("/jobs");
      const result = res.data;

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
  }, [debouncedSearch, message]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, page, pageSize]);

  // Thêm công việc
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

  // Sửa công việc
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

  // Xóa công việc
  const handleDelete = useCallback(
    async (jobId: string) => {
      try {
        await api.delete(`/jobs/${jobId}`);
        message.success("Xóa công việc thành công!");
        fetchJobs();
      } catch (err) {
        console.error(err);
        message.error("Có lỗi khi xóa!");
      }
    },
    [fetchJobs, message]
  );

  const columns: ColumnsType<Job> = useMemo(
    () => [
      {
        title: "Tên công việc",
        dataIndex: "jobName",
        key: "jobName",
        width: 200,
      },
      {
        title: "Kỹ năng",
        dataIndex: "skills",
        key: "skills",
        width: 200,
      },
      {
        title: "Yêu cầu",
        dataIndex: "requirement",
        key: "requirement",
        width: 220,
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
        fixed: "right",
        width: 120,
        render: (_: string, record: Job) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: token.colorPrimary }} />}
              onClick={() => {
                setEditingJob(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc muốn xóa công việc "${record.jobName}"?`}
              onConfirm={() => handleDelete(record.jobId)}
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
    [handleDelete, token.colorPrimary]
  );

  const handleReset = () => {
    setSearch("");
    setPage(1);
    setPageSize(5);
  };

  return (
    <Card
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
      }}
      title="Quản lý công việc"
    >
      <Space
        style={{
          marginBottom: token.margin,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        {/* Bên trái: tìm kiếm + làm mới */}
        <Space style={{ flexWrap: "wrap" }}>
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
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Làm mới
          </Button>
        </Space>

        {/* Bên phải: nút thêm công việc */}
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
        dataSource={data.slice((page - 1) * pageSize, page * pageSize)}
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
    </Card>
  );
}
