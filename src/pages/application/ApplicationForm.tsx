import { Form, Input, Button, Upload, Card, Typography, Result, message } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "~/api/config";

const { Title, Text } = Typography;

export default function ApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const recruitmentId = queryParams.get("id") || "";
  const positionTitle = queryParams.get("title") || "";

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // useMessage instance
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: { name: string; email: string; phone: string }) => {
    if (!file) {
      messageApi.warning("Vui lòng chọn hồ sơ đính kèm!");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("position", positionTitle);
    formData.append("recruitmentId", recruitmentId);
    formData.append("resume", file);

    setLoading(true);
    try {
      await axios.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      messageApi.success("Gửi hồ sơ thành công!");
      setTimeout(() => navigate("/recruitments"), 2000);
    } catch (err) {
      console.error(err);
      messageApi.error("Gửi hồ sơ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        {contextHolder}
        <Card
          style={{
            maxWidth: 480,
            margin: "60px auto",
            textAlign: "center",
            borderRadius: 16,
          }}
        >
          <Result
            status="success"
            title="Cảm ơn bạn đã ứng tuyển!"
            subTitle="Bạn sẽ được chuyển về trang chủ trong giây lát..."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <Title level={4} style={{ margin: 0 }}>
              Ứng tuyển vị trí: {positionTitle}
            </Title>
          </div>
        }
        style={{
          maxWidth: 600,
          margin: "60px auto",
          borderRadius: 16,
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nhập họ tên của bạn" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Hồ sơ đính kèm (PDF)"
            required
            tooltip="Chỉ nhận 1 file PDF duy nhất"
          >
            <Upload
              accept=".pdf"
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                if (!isPDF) {
                  messageApi.error("Chỉ chấp nhận file PDF!");
                  return Upload.LIST_IGNORE;
                }
                setFile(file);
                return false; // chặn upload tự động
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
            {file && (
              <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
                {/* File đã chọn: <strong>{file.name}</strong> */}
              </Text>
            )}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Gửi hồ sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
