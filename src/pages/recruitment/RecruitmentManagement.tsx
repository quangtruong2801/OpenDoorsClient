import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Space, Popconfirm, Input, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

import api from "../../api/config";
import type { Recruitment } from "../../types/Recruitment";
import AddRecruitmentModal from "../../components/RecruitmentModal";

// Hook debounce
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const { Option } = Select;

export default function RecruitmentManagement() {
  const [data, setData] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || ""
  );
  const [salaryFilter, setSalaryFilter] = useState(
    searchParams.get("salary") || ""
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 10
  );

  const debouncedSearch = useDebounce(search, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] =
    useState<Recruitment | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Cập nhật URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (locationFilter) params.location = locationFilter;
    if (salaryFilter) params.salary = salaryFilter;
    params.page = String(page);
    params.pageSize = String(pageSize);
    setSearchParams(params);
  }, [search, locationFilter, salaryFilter, page, pageSize, setSearchParams]);

  // Fetch API filter + pagination
  const fetchRecruitments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/recruitments/filter", {
        params: {
          keyword: debouncedSearch || undefined,
          location: locationFilter || undefined,
          salary: salaryFilter || undefined,
          page,
          pageSize,
        },
      });

      const { data: items, total } = res.data;
      const result = items.map((r: Recruitment) => ({
        ...r,
        deadline: r.deadline ? new Date(r.deadline) : null,
      }));

      setData(result);
      setTotal(total);
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải danh sách tuyển dụng");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, locationFilter, salaryFilter, page, pageSize]);

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
    } catch (err) {
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
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  // Xóa
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/recruitments/${id}`);
        message.success("Xóa thành công!");
        fetchRecruitments();
      } catch (err) {
        console.error(err);
        message.error("Xóa thất bại");
      }
    },
    [fetchRecruitments]
  );

  const columns: ColumnsType<Recruitment> = useMemo(
    () => [
      { title: "Tiêu đề", dataIndex: "title", key: "title", width: 180 },
      { title: "Mức lương", dataIndex: "salary", key: "salary", width: 120 },
      { title: "Địa điểm", dataIndex: "location", key: "location", width: 150 },
      { title: "Kinh nghiệm", dataIndex: "experience", key: "experience", width: 120 },
      {
        title: "Hạn nộp",
        dataIndex: "deadline",
        key: "deadline",
        width: 120,
        render: (date: Date) => (date ? dayjs(date).format("DD/MM/YYYY") : ""),
      },
      { title: "Mô tả công việc", dataIndex: "description", key: "description", width: 250, ellipsis: true },
      { title: "Yêu cầu ứng viên", dataIndex: "requirements", key: "requirements", width: 250, ellipsis: true },
      { title: "Quyền lợi", dataIndex: "benefits", key: "benefits", width: 250, ellipsis: true },
      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_: string, record: Recruitment) => (
          <Space>
            <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingRecruitment(record); setIsModalOpen(true); }} />
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

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Space wrap>
          <Input
            placeholder="Tìm theo tiêu đề"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Chọn địa điểm"
            value={locationFilter || undefined}
            onChange={(value) => { setLocationFilter(value || ""); setPage(1); }}
            allowClear
            style={{ width: 160 }}
          >
            {Array.from(new Set(data.map(d => d.location))).map(l => (
              <Option key={l} value={l}>{l}</Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn mức lương"
            value={salaryFilter || undefined}
            onChange={(value) => { setSalaryFilter(value || ""); setPage(1); }}
            allowClear
            style={{ width: 140 }}
          >
            {Array.from(new Set(data.map(d => d.salary))).map(s => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            type="default"
            onClick={() => { setSearch(""); setLocationFilter(""); setSalaryFilter(""); setPage(1); }}
          />
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingRecruitment(null); setIsModalOpen(true); }}
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      <AddRecruitmentModal
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingRecruitment(null); }}
        onSubmit={editingRecruitment ? handleEditRecruitment : handleAddRecruitment}
        initialValues={editingRecruitment || undefined}
        isEdit={!!editingRecruitment}
      />
    </div>
  );
}
