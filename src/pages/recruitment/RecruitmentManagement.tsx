import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Button, message, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams } from "react-router-dom";

import api from "../../api/config";
import type { Recruitment } from "../../types/Recruitment";
import AddRecruitmentModal from "../../components/RecruitmentModal";
import useDebounce from "../../hooks/useDebounce";
import RecruitmentFilter from "../../components/RecruitmentFilter";

export default function RecruitmentManagement() {
  const [data, setData] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    salary: searchParams.get("salary") || "",
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
  });

  const debouncedSearch = useDebounce(filters.search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] =
    useState<Recruitment | null>(null);

  const pageSizeOptions = ["5", "10", "20", "50", "100"];

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.salary) params.salary = filters.salary;
    params.page = String(filters.page);
    params.pageSize = String(filters.pageSize);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch API
  const fetchRecruitments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/recruitments/filter", {
        params: {
          keyword: debouncedSearch || undefined,
          location: filters.location || undefined,
          salary: filters.salary || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        },
      });

      const { data: items, total } = res.data;
      setData(
        items.map((r: Recruitment) => ({
          ...r,
          deadline: r.deadline ? new Date(r.deadline) : null,
        }))
      );
      setTotal(total);
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải danh sách tuyển dụng");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    filters.location,
    filters.salary,
    filters.page,
    filters.pageSize,
  ]);

  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  // CRUD handlers
  const handleAddRecruitment = async (values: Omit<Recruitment, "id">) => {
    try {
      await api.post("/recruitments", {
        ...values,
        deadline: values.deadline?.toISOString() || null,
      });
      message.success("Thêm tin tuyển dụng thành công!");
      setIsModalOpen(false);
      fetchRecruitments();
    } catch (err) {
      console.error(err);
      message.error("Thêm thất bại");
    }
  };

  const handleEditRecruitment = async (values: Omit<Recruitment, "id">) => {
    if (!editingRecruitment) return;
    try {
      await api.put(`/recruitments/${editingRecruitment.id}`, {
        ...values,
        deadline: values.deadline?.toISOString() || null,
      });
      message.success("Cập nhật tin thành công!");
      setEditingRecruitment(null);
      setIsModalOpen(false);
      fetchRecruitments();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

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
        render: (date: Date) => (date ? dayjs(date).format("DD/MM/YYYY") : ""),
      },
      {
        title: "Mô tả công việc",
        dataIndex: "description",
        key: "description",
        width: 250,
        ellipsis: true,
        render: (desc: string[]) => (
          <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
            {desc?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        ),
      },
      {
        title: "Yêu cầu ứng viên",
        dataIndex: "requirements",
        key: "requirements",
        width: 250,
        ellipsis: true,
        render: (desc: string[]) => (
          <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
            {desc?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        ),
      },
      {
        title: "Quyền lợi",
        dataIndex: "benefits",
        key: "benefits",
        width: 250,
        ellipsis: true,
        render: (desc: string[]) => (
          <ul style={{ listStyleType: "none", paddingLeft: "1rem" }}>
            {desc?.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        ),
      },

      {
        title: "Hành động",
        key: "action",
        width: 120,
        fixed: "right",
        render: (_, record) => (
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

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <RecruitmentFilter
          filters={filters}
          locations={Array.from(new Set(data.map((d) => d.location)))}
          salaries={Array.from(new Set(data.map((d) => d.salary)))}
          onChange={(newFilters) =>
            setFilters({ ...filters, ...newFilters, page: 1 })
          }
          onReset={() =>
            setFilters({
              search: "",
              location: "",
              salary: "",
              page: 1,
              pageSize: filters.pageSize,
            })
          }
        />

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
          current: filters.page,
          pageSize: filters.pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions,
          onChange: (p, ps) =>
            setFilters({ ...filters, page: p, pageSize: ps }),
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
