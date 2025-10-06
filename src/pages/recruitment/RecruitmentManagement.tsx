import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Space, Popconfirm, Input, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

import api from "../../api/config"; // <-- dùng axios instance
import type { Recruitment } from "../../types/Recruitment";
import AddRecruitmentModal from "../../components/RecruitmentModal";

const { Option } = Select;

export default function RecruitmentManagement() {
  const [data, setData] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] =
    useState<Recruitment | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // 📡 Fetch recruitment
  const fetchRecruitments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Recruitment[]>("/recruitments");
      const result = res.data;

      // ✅ Chuyển deadline sang Date
      const withDate = result.map((r) => ({
        ...r,
        deadline: r.deadline ? new Date(r.deadline) : new Date(),
      }));

      // Apply filter
      const filtered = withDate.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) &&
          (companyFilter ? r.companyName === companyFilter : true) &&
          (salaryFilter ? r.salary === salaryFilter : true)
      );

      setTotal(filtered.length);
      setData(filtered.slice((page - 1) * pageSize, page * pageSize));
    } catch (err: unknown) {
      console.error(err);
      message.error("Lỗi tải danh sách tuyển dụng");
    } finally {
      setLoading(false);
    }
  }, [search, companyFilter, salaryFilter, page, pageSize]);

  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  // Thêm
  const handleAddRecruitment = async (values: Omit<Recruitment, "id">) => {
    try {
      const payload = {
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : null,
      };

      await api.post("/recruitments", payload);
      message.success("Thêm tin tuyển dụng thành công!");
      setIsModalOpen(false);
      fetchRecruitments();
    } catch (err: unknown) {
      console.error(err);
      message.error("Thêm thất bại");
    }
  };

  // Sửa
  const handleEditRecruitment = async (values: Omit<Recruitment, "id">) => {
    if (!editingRecruitment) return;

    const payload = {
      ...values,
      deadline: values.deadline ? values.deadline.toISOString() : null,
    };

    try {
      await api.put(`/recruitments/${editingRecruitment.id}`, payload);
      message.success("Cập nhật tin thành công!");
      setEditingRecruitment(null);
      setIsModalOpen(false);
      fetchRecruitments();
    } catch (err: unknown) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  // Delete
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/recruitments/${id}`);
        message.success("Xóa thành công!");
        fetchRecruitments();
      } catch (err: unknown) {
        console.error(err);
        message.error("Xóa thất bại");
      }
    },
    [fetchRecruitments]
  );

  const columns: ColumnsType<Recruitment> = useMemo(
    () => [
      { title: "Tiêu đề", dataIndex: "title", key: "title", width: 180 },
      {
        title: "Công ty",
        dataIndex: "companyName",
        key: "companyName",
        width: 150,
      },
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
      },
      {
        title: "Yêu cầu ứng viên",
        dataIndex: "requirements",
        key: "requirements",
        width: 250,
        ellipsis: true,
      },
      {
        title: "Quyền lợi",
        dataIndex: "benefits",
        key: "benefits",
        width: 250,
        ellipsis: true,
      },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_: string, record: Recruitment) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRecruitment(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="Xóa tin tuyển dụng này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete]
  );

  // Lấy danh sách công ty & mức lương có sẵn cho filter
  const companyList = useMemo(
    () => Array.from(new Set(data.map((d) => d.companyName))),
    [data]
  );
  const salaryList = useMemo(
    () => Array.from(new Set(data.map((d) => d.salary))),
    [data]
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Filter */}
        <Space wrap>
          <Input
            placeholder="Tìm theo tiêu đề"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Chọn công ty"
            value={companyFilter || undefined}
            onChange={(value) => {
              setCompanyFilter(value || "");
              setPage(1);
            }}
            allowClear
            style={{ width: 160 }}
          >
            {companyList.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn mức lương"
            value={salaryFilter || undefined}
            onChange={(value) => {
              setSalaryFilter(value || "");
              setPage(1);
            }}
            allowClear
            style={{ width: 140 }}
          >
            {salaryList.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          {/* <Button
            type="default"
            onClick={() => {
              setSearch("");
              setCompanyFilter("");
              setSalaryFilter("");
              setPage(1);
            }}
          >
            Reset
          </Button> */}
        </Space>

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
        dataSource={data}
        rowKey="id"
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

      <AddRecruitmentModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecruitment(null);
        }}
        onSubmit={
          editingRecruitment ? handleEditRecruitment : handleAddRecruitment
        }
        initialValues={editingRecruitment || undefined}
        isEdit={!!editingRecruitment}
      />
    </div>
  );
}
