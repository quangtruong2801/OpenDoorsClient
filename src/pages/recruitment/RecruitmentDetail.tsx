import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Button } from "antd";
import {
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  DollarSign,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/config"; // <-- dùng axios instance
import dayjs from "dayjs";

type Recruitment = {
  id: string;
  title: string;
  companyName: string;
  salary: string;
  location: string;
  experience: number;
  deadline: string;
  description: string;
  requirements: string;
  benefits: string;
  email?: string;
  phone?: string;
};

export default function RecruitmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruitment = async () => {
      setLoading(true);
      try {
        const res = await api.get<Recruitment>(`/recruitments/${id}`);
        setRecruitment(res.data);
      } catch (err: unknown) {
        console.error("Lỗi tải tin tuyển dụng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruitment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!recruitment) {
    return (
      <p className="text-center mt-10 text-lg">
        Không tìm thấy tin tuyển dụng.
      </p>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Phần đầu */}
      <div
        className="rounded-2xl p-8 shadow-lg text-center mb-10"
        style={{
          backgroundColor: "var(--color-menu-item-selected)",
          color: "#fff",
        }}
      >
        <h1 className="text-3xl font-bold mb-2">{recruitment.title}</h1>
        <div className="flex items-center justify-center gap-2 text-lg">
          <Building2 size={20} />
          <span>{recruitment.companyName}</span>
        </div>
        <Button
          size="large"
          className="mt-6 rounded-full px-10 py-5 text-lg hover:scale-105 transition-transform"
          style={{
            backgroundColor: "#fff",
            color: "var(--color-menu-item-selected)",
            border: "none",
            fontWeight: 600,
          }}
        >
          Ứng tuyển ngay
        </Button>
      </div>

      {/* Thông tin tổng quan */}
      <div
        className="grid md:grid-cols-2 gap-6 mb-10 p-6 rounded-xl shadow-md border"
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        <InfoItem
          icon={<DollarSign size={20} />}
          label="Mức lương"
          value={recruitment.salary}
        />
        <InfoItem
          icon={<MapPin size={20} />}
          label="Địa điểm"
          value={recruitment.location}
        />
        <InfoItem
          icon={<Briefcase size={20} />}
          label="Kinh nghiệm"
          value={`${recruitment.experience} năm`}
        />
        <InfoItem
          icon={<Calendar size={20} />}
          label="Hạn nộp hồ sơ"
          value={dayjs(recruitment.deadline).format("DD-MM-YYYY")}
        />
      </div>

      {/* Nội dung chi tiết */}
      <Section title="📄 Mô tả công việc" content={recruitment.description} />
      <Section title="✅ Yêu cầu ứng viên" content={recruitment.requirements} />
      <Section title="🎁 Quyền lợi" content={recruitment.benefits} />

      {/* Liên hệ */}
      <motion.div
        className="mt-12 p-6 rounded-xl shadow-md border"
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-4">📞 Thông tin liên hệ</h2>
        <div className="space-y-3 text-lg">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-[var(--color-menu-item-selected)]" />
            <span>{recruitment.email || "Chưa cập nhật"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={20} className="text-[var(--color-menu-item-selected)]" />
            <span>{recruitment.phone || "Chưa cập nhật"}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 🧩 Component con: Thông tin tổng quan
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
    <div className="flex items-center gap-3 text-lg">
      <span className="text-[var(--color-menu-item-selected)]">{icon}</span>
      <div>
        <p className="font-semibold">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  );
}

// 🧩 Component con: Section nội dung
function Section({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <motion.div
      className="mb-10 p-6 rounded-xl shadow-md border"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-lg leading-relaxed whitespace-pre-line">{content}</p>
    </motion.div>
  );
}
