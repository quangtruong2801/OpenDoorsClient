import { useEffect, useState } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { Spin, Button, Tag } from "antd";
import {
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  DollarSign,
  // Building2,
} from "lucide-react";
import api from "../../api/config"; // axios instance
import dayjs from "dayjs";

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
  // companyName?: string; 
};

export default function RecruitmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <p className="text-center mt-10 text-lg text-gray-600">
        Không tìm thấy tin tuyển dụng.
      </p>
    );
  }

  const isExpired = dayjs(recruitment.deadline).isBefore(dayjs());

  return (
    <div className="p-6 mx-[80px] space-y-10 bg-gray-50 rounded-2xl shadow-lg">
      {/* Nút Quay lại */}
      <div>
      <Button
        type="default"
        className="mb-2"
        onClick={() => navigate(-1)}
      >
        &larr; Quay lại
      </Button>
      </div>
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 rounded-2xl flex flex-col justify-center items-center text-white text-center">
        <h1 className="text-3xl font-bold mb-2">{recruitment.title}</h1>

        {/* Nếu muốn hiển thị tên công ty sau này, bỏ comment */}
        {/* <div className="flex items-center justify-center gap-3">
          <Building2 size={20} />
          <span className="font-medium">{recruitment.companyName || "Công ty chưa có tên"}</span>
        </div> */}

        <Tag color={isExpired ? "red" : "green"} className="font-semibold mt-2">
          {isExpired ? "Hết hạn" : "Đang tuyển"}
        </Tag>

        {/* Button Ứng tuyển nổi */}
        <Button
          size="large"
          className="absolute -bottom-6 rounded-full px-12 py-4 text-lg font-semibold text-blue-600 bg-white shadow-lg hover:scale-105 transition-transform"
        >
          Ứng tuyển ngay
        </Button>
      </div>

      {/* Thông tin tổng quan */}
      <div className="grid md:grid-cols-2 gap-6 p-6 rounded-xl shadow-md border bg-white text-gray-800">
        <InfoItem
          icon={<DollarSign size={20} />}
          label="Mức lương"
          value={recruitment.salary || "Chưa cập nhật"}
        />
        <InfoItem
          icon={<MapPin size={20} />}
          label="Địa điểm"
          value={recruitment.location || "Chưa cập nhật"}
        />
        <InfoItem
          icon={<Briefcase size={20} />}
          label="Kinh nghiệm"
          value={`${recruitment.experience || 0} năm`}
        />
        <InfoItem
          icon={<Calendar size={20} />}
          label="Hạn nộp hồ sơ"
          value={dayjs(recruitment.deadline).format("DD-MM-YYYY")}
        />
      </div>

      {/* Nội dung chi tiết */}
      <Section title="Mô tả công việc" content={recruitment.description} />
      <Section title="Yêu cầu ứng viên" content={recruitment.requirements} />
      <Section title="Quyền lợi" content={recruitment.benefits} />

      {/* Liên hệ */}
      <div className="p-6 rounded-xl shadow-md border bg-white text-gray-800 space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Thông tin liên hệ</h2>
        <div className="space-y-2 text-lg">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-blue-600" />
            <span>{recruitment.email || "Chưa cập nhật"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-blue-600" />
            <span>{recruitment.phone || "Chưa cập nhật"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component con: Thông tin tổng quan
function InfoItem({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-lg">
      <span className="text-blue-600">{icon}</span>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-gray-700">{value}</p>
      </div>
    </div>
  );
}

// Component con: Section nội dung
function Section({ title, content }: { title: string; content: string[] }) {
  return (
    <div className="mb-10 p-6 rounded-xl shadow-md border bg-white text-gray-800">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <ul className="list-none space-y-2 text-lg leading-relaxed">
        {content.map((item, index) => (
          <li key={index} className="before:content-['-'] before:mr-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

