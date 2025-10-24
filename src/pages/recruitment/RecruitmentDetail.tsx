import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Spin,
  Button,
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  theme,
} from "antd";
import {
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import api from "~/api/config";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

type Recruitment = {
  id: string;
  title: string;
  salary: string;
  location: string;
  experience: number;
  deadline: string;
  description: string[];
  requirements: string[];
  benefits: string[];
  email?: string;
  phone?: string;
};

export default function RecruitmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);

  const { token } = theme.useToken();
  const isDarkMode = (() => {
    const color = token.colorBgBase?.toLowerCase() || "";
    return (
      color.startsWith("#0") || color.startsWith("#1") || color.startsWith("#2")
    );
  })();

  const headerGradient = isDarkMode
    ? "linear-gradient(90deg, #0f172a, #1e293b, #334155)"
    : "linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)";

  useEffect(() => {
    const fetchRecruitment = async () => {
      setLoading(true);
      try {
        const res = await api.get<Recruitment>(`/recruitments/${id}`);
        setRecruitment(res.data);
      } catch (err) {
        console.error("Lỗi tải tin tuyển dụng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruitment();
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <Spin size="large" />
      </div>
    );

  if (!recruitment)
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Title level={4}>Không tìm thấy tin tuyển dụng.</Title>
      </div>
    );

  const isExpired = dayjs(recruitment.deadline).isBefore(dayjs());

  return (
    <div style={{ padding: "32px", minHeight: "100vh" }}>
      {/* ---------- Header ---------- */}
      <Card
        style={{
          borderRadius: 16,
          background: headerGradient,
          color: "#fff",
          textAlign: "center",
          position: "relative",
          transition: "background 0.3s ease",
        }}
        variant="borderless"
      >
        <Title level={2} style={{ color: "#fff", marginBottom: 8 }}>
          {recruitment.title}
        </Title>

        <Tag
          color={isExpired ? "red" : "green"}
          style={{ fontWeight: 600, marginBottom: 16 }}
        >
          {isExpired ? "Hết hạn" : "Đang tuyển"}
        </Tag>

        <div style={{ marginTop: 16 }}>
          <Link
            to={`/apply?id=${recruitment.id}&title=${encodeURIComponent(
              recruitment.title
            )}`}
          >
            <Button type="primary" size="large">
              Ứng tuyển ngay
            </Button>
          </Link>
        </div>

        <Button
          type="default"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: isDarkMode ? "#1e293b" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
            border: "none",
          }}
        />
      </Card>

      <Divider />

      {/* ---------- Main Content ---------- */}
      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <InfoSection
            title="Mô tả công việc"
            items={recruitment.description}
            color={token.colorPrimary}
          />
          <InfoSection
            title="Yêu cầu ứng viên"
            items={recruitment.requirements}
            color={token.colorPrimary}
          />
          <InfoSection
            title="Quyền lợi"
            items={recruitment.benefits}
            color={token.colorPrimary}
          />
        </Col>

        <Col xs={24} md={8}>
          <Card variant="borderless">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <InfoItem
                icon={<DollarSign size={18} />}
                label="Mức lương"
                value={recruitment.salary || "Chưa cập nhật"}
              />
              <InfoItem
                icon={<MapPin size={18} />}
                label="Địa điểm"
                value={recruitment.location || "Chưa cập nhật"}
              />
              <InfoItem
                icon={<Briefcase size={18} />}
                label="Kinh nghiệm"
                value={`${recruitment.experience || 0} năm`}
              />
              <InfoItem
                icon={<Calendar size={18} />}
                label="Hạn nộp hồ sơ"
                value={dayjs(recruitment.deadline).format("DD-MM-YYYY")}
              />
            </Space>
          </Card>

          <Card variant="borderless" style={{ marginTop: 24 }}>
            <Title level={4} style={{ color: token.colorPrimary }}>
              Thông tin liên hệ
            </Title>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <ContactItem
                icon={<Mail size={18} />}
                value={recruitment.email || "Chưa cập nhật"}
              />
              <ContactItem
                icon={<Phone size={18} />}
                value={recruitment.phone || "Chưa cập nhật"}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

/* ---------- Sub Components ---------- */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#3b82f6" }}>{icon}</span>
      <div>
        <Text strong>{label}</Text>
        <Paragraph style={{ margin: 0 }}>{value}</Paragraph>
      </div>
    </div>
  );
}

function ContactItem({ icon, value }: { icon: JSX.Element; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ color: "#3b82f6" }}>{icon}</span>
      <Text>{value}</Text>
    </div>
  );
}

function InfoSection({
  title,
  items,
  color = "#3b82f6",
}: {
  title: string;
  items: string[];
  color?: string;
}) {
  return (
    <Card variant="borderless" style={{ marginBottom: 24 }}>
      <Title level={3} style={{ color, transition: "color 0.3s ease" }}>
        {title}
      </Title>
      <ul style={{ paddingLeft: 20 }}>
        {items.map((item, index) => (
          <li key={index}>
            <Text>{item}</Text>
          </li>
        ))}
      </ul>
    </Card>
  );
}
