import { Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/config";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Lấy recruitmentId và title từ query string
  const recruitmentId = queryParams.get("id") || "";
  const positionTitle = queryParams.get("title") || "";

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onFinish = async (values: { name: string; email: string; phone: string }) => {
    if (!file) {
      message.warning("Vui lòng chọn hồ sơ đính kèm!");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("position", positionTitle); // title
    formData.append("recruitmentId", recruitmentId); // id
    formData.append("resume", file);

    setLoading(true);
    try {
      await axios.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      message.success("Gửi hồ sơ thành công!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      message.error("Gửi hồ sơ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-white rounded shadow text-center max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Cảm ơn bạn đã ứng tuyển!</h2>
        <p>Bạn sẽ được chuyển về trang chủ trong giây lát...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded shadow max-w-lg mx-auto">
      {/* Nút Quay lại */}
      <div>
        <Button type="default" className="mb-2" onClick={() => navigate(-1)}>
          &larr; Quay lại
        </Button>
      </div>
      <h2 className="text-xl font-semibold mb-4">Ứng tuyển vị trí: {positionTitle}</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Hồ sơ đính kèm (PDF)">
          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Gửi hồ sơ
        </Button>
      </Form>
    </div>
  );
}
