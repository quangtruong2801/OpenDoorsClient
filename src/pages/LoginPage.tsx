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

      const data: { token: string; name: string; role: string; id: string } =
        await res.json();

      await login(data.token); // lưu token + user info
      message.success(`Xin chào ${data.name || "User"}!`);

      // Redirect sau khi login thành công
      navigate("/");
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error)
        message.error(err.message || "Đăng nhập thất bại!");
      else message.error("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <Form
        onFinish={onFinish}
        className="p-10 bg-white rounded-2xl shadow-xl w-full max-w-md transition-transform transform hover:scale-105"
        layout="vertical"
      >
        <h2 className="text-center mb-8 text-2xl font-extrabold text-gray-800 tracking-tight">
          Đăng nhập
        </h2>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Email</span>}
          name="email"
          rules={[{ required: true, message: "Nhập email!" }]}
          className="mb-6"
        >
          <Input
            placeholder="Nhập email của bạn"
            className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 px-4 w-[280px] mx-auto"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Mật khẩu</span>}
          name="password"
          rules={[{ required: true, message: "Nhập mật khẩu!" }]}
          className="mb-6"
        >
          <Input.Password
            placeholder="••••••••"
            className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 px-4 w-[280px] mx-auto"
          />
        </Form.Item>

        <Form.Item className="mb-4 flex justify-center">
          <Button
            type="primary"
            htmlType="submit"
            className="w-[280px] py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white font-semibold shadow-md transition-all duration-300"
            loading={loading}
          >
            Đăng nhập
          </Button>
        </Form.Item>

        <p className="text-center text-sm text-gray-500 mt-4">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-purple-500 hover:underline">
            Đăng ký
          </a>
        </p>
      </Form>
    </div>
  );
}
