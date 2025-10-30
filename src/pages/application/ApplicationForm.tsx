import { Form, Input, Button, Upload, Card, Typography, Result, message } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "~/api/config";
import { useTranslation } from "react-i18next";

const { Title} = Typography;

export default function ApplicationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const recruitmentId = queryParams.get("id") || "";
  const positionTitle = queryParams.get("title") || "";

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: { name: string; email: string; phone: string }) => {
    if (!file) {
      messageApi.warning(t("applicationForm.fileWarning"));
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
      messageApi.success(t("applicationForm.submitSuccess"));
      setTimeout(() => navigate("/recruitments"), 2000);
    } catch (err) {
      console.error(err);
      messageApi.error(t("applicationForm.submitFail"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        {contextHolder}
        <Card style={{ maxWidth: 480, margin: "60px auto", textAlign: "center", borderRadius: 16 }}>
          <Result
            status="success"
            title={t("applicationForm.successTitle")}
            subTitle={t("applicationForm.successSubTitle")}
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
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {t("applicationForm.applyTitle", { title: positionTitle })}
            </Title>
          </div>
        }
        style={{ maxWidth: 600, margin: "60px auto", borderRadius: 16 }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label={t("applicationForm.fullName")}
            rules={[{ required: true, message: t("applicationForm.rules.name") }]}
          >
            <Input placeholder={t("applicationForm.placeholder.name")} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("applicationForm.email")}
            rules={[
              { required: true, message: t("applicationForm.rules.email") },
              { type: "email", message: t("applicationForm.rules.invalidEmail") },
            ]}
          >
            <Input placeholder={t("applicationForm.placeholder.email")} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t("applicationForm.phone")}
            rules={[{ required: true, message: t("applicationForm.rules.phone") }]}
          >
            <Input placeholder={t("applicationForm.placeholder.phone")} />
          </Form.Item>

          <Form.Item
            label={t("applicationForm.resume")}
            required
            tooltip={t("applicationForm.resumeTooltip")}
          >
            <Upload
              accept=".pdf"
              beforeUpload={(file) => {
                const isPDF = file.type === "application/pdf";
                if (!isPDF) {
                  messageApi.error(t("applicationForm.pdfOnly"));
                  return Upload.LIST_IGNORE;
                }
                setFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>{t("applicationForm.selectFile")}</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {t("applicationForm.submit")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
