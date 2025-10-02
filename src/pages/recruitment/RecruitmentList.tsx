import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Button } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import type { Recruitment } from "../../types/Recruitment";
import { API_BASE_URL } from "../../api/config";

export default function RecruitmentList() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruitments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/recruitments`);
        const data = await res.json();
        const parsed = data.map((r: Recruitment) => ({
          ...r,
          deadline: new Date(r.deadline),
        }));
        setRecruitments(parsed);
      } catch (err) {
        console.error("Lỗi tải danh sách tuyển dụng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruitments();
  }, []);

  if (loading) return <Spin style={{ display: "block", margin: "100px auto" }} />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600" style={{ color: "var(--color-text)" }}>
        💼 Danh sách tuyển dụng
      </h1>

      <Row gutter={[24, 24]}>
        {recruitments.map((job, index) => (
          <Col xs={24} sm={12} md={8} key={job.id}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.03,
                borderColor: "var(--color-menu-item-selected)",
              }}
              className="rounded-2xl border border-[rgba(59,130,246,0.3)] backdrop-blur-sm transition-all"
              style={{
                background: "transparent",
                color: "var(--color-text)", 
              }}
            >
              <Card
                hoverable
                title={<span className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>{job.title}</span>}
                variant="borderless"
                style={{
                  background: "transparent", 
                  boxShadow: "none",
                  border: "none",
                  color: "var(--color-text)",
                }}
              >
                <div className="mb-3 text-[15px]">
                  <p><strong>🏢 Công ty:</strong> {job.companyName}</p>
                  <p><strong>📍 Địa điểm:</strong> {job.location}</p>
                  <p><strong>💰 Mức lương:</strong> {job.salary}</p>
                  <p><strong>📅 Hạn nộp:</strong> {dayjs(job.deadline).format("DD-MM-YYYY")}</p>
                </div>

                <Link to={`/recruitment/${job.id}`}>
                  <Button type="primary" block>
                    Xem chi tiết
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
