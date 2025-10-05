import { useState } from "react";
import { Button, Input, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { API_BASE_URL } from "../api/config";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Login failed");
      }

      const data: { token: string; name: string; role: string; id: string } = await res.json();

      await login(data.token); // lưu token + user info
      message.success(`Xin chào ${data.name || "User"}!`);

      // ✅ Redirect sau khi login thành công
      navigate("/"); // hoặc "/dashboard" nếu bạn có trang dashboard
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error) message.error(err.message || "Đăng nhập thất bại!");
      else message.error("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Form
        onFinish={onFinish}
        className="p-8 bg-white rounded shadow-md w-[320px]"
        layout="vertical"
      >
        <h2 className="text-center mb-4 text-xl font-bold">Admin Login</h2>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Nhập email!" }]}
        >
          <Input placeholder="Email của bạn" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
