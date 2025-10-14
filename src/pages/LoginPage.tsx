import { useState } from "react";
import { Button, Input, Form, message, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { API_BASE_URL } from "../api/config";
import logo from "../assets/logoVNTT1.png";

const { Title, Text, Link } = Typography;

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

      await login(data.token);
      message.success(`Xin chào ${data.name || "User"}!`);
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(to top, #cce7ff, #e6f0ff)",
      }}
    >
      <Card
        style={{ width: "100%", maxWidth: 400, textAlign: "center" }}
        variant="borderless"
        hoverable
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%", 
            marginBottom: 24,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 150, 
              height: "auto", 
              maxWidth: "100%", 
              objectFit: "contain",
            }}
          />
        </div>

        <Title level={2}>Đăng nhập</Title>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Nhập email!" }]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
          Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
        </Text>
      </Card>
    </div>
  );
}
