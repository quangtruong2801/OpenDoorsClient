import { useState } from "react";
import { Button, Input, Form, message, Card, Typography, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { API_BASE_URL } from "../api/config";
import { useTranslation } from "react-i18next";
import logo from "../assets/logoVNTT1.png";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();
  const { t } = useTranslation();

  // Tự nhận diện chế độ dark/light
  const isDarkMode = (() => {
    const color = token.colorBgBase?.toLowerCase() || "";
    return color.startsWith("#0") || color.startsWith("#1") || color.startsWith("#2");
  })();

  const backgroundGradient = isDarkMode
    ? "linear-gradient(to top, #1b2735, #2c3e50)"
    : "linear-gradient(to top, #cce7ff, #e6f0ff)";

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
        throw new Error(errorText || t("loginPage.error"));
      }

      const data: { token: string; name: string; role: string; id: string } =
        await res.json();

      await login(data.token);
      message.success(`${t("loginPage.welcome")} ${data.name || "User"}!`);
      navigate("/");
    } catch (err: unknown) {
      console.error("Login error:", err);
      if (err instanceof Error)
        message.error(err.message || t("loginPage.failed"));
      else message.error(t("loginPage.failed"));
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
        background: backgroundGradient,
        transition: "background 0.3s ease",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          boxShadow: token.boxShadow,
        }}
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

        <Title level={2}>{t("loginPage.title")}</Title>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label={t("loginPage.emailLabel")}
            name="email"
            rules={[{ required: true, message: t("loginPage.emailRequired") }]}
          >
            <Input placeholder={t("loginPage.emailPlaceholder")} />
          </Form.Item>

          <Form.Item
            label={t("loginPage.passwordLabel")}
            name="password"
            rules={[{ required: true, message: t("loginPage.passwordRequired") }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t("loginPage.button")}
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: "block", marginTop: 16 }} />
      </Card>
    </div>
  );
}
