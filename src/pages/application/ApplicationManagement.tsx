import { useEffect, useState, useCallback } from "react";
import { Table, Button, Popconfirm, message, Select, theme, Typography, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "~/api/config";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Application } from "~/types/Application";

const { Title } = Typography;

export default function ApplicationManagement() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
  });

  const {
    token: { colorBgContainer, colorText, colorBorderSecondary },
  } = theme.useToken();

  const [msgApi, contextHolder] = message.useMessage();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/applications");
      setData(res.data);
    } catch (err) {
      console.error(err);
      msgApi.error("Không tải được danh sách ứng tuyển!");
    } finally {
      setLoading(false);
    }
  }, [msgApi]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/applications/${id}`);
      msgApi.success("Đã xóa hồ sơ ứng tuyển!");
      fetchApplications();
    } catch (err) {
      console.error(err);
      msgApi.error("Lỗi khi xóa!");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`/applications/${id}/status`, { status: newStatus });
      msgApi.success("Cập nhật trạng thái thành công!");
      fetchApplications();
    } catch (err) {
      console.error(err);
      msgApi.error("Cập nhật thất bại!");
    }
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination(pag);
  };

  const columns: ColumnsType<Application> = [
    { title: "Họ tên", dataIndex: "name", key: "name", width: 180 },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: 140 },
    { title: "Vị trí", dataIndex: "position", key: "position", width: 180 },
    {
      title: "Hồ sơ",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      width: 150,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          Xem hồ sơ
        </a>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: 120 }}
          options={[
            { value: "pending", label: "Chờ duyệt" },
            { value: "reviewed", label: "Đã xem" },
            { value: "accepted", label: "Đã nhận" },
            { value: "rejected", label: "Từ chối" },
          ]}
        />
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xóa hồ sơ này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div
      style={{
        background: colorBgContainer,
        color: colorText,
        border: `1px solid ${colorBorderSecondary}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      {contextHolder}

      <Space direction="vertical" style={{ width: "100%" }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          Quản lý hồ sơ ứng tuyển
        </Title>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Space>
    </div>
  );
}
