import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Button, Tag } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { Recruitment } from "../types/Recruitment";
import api from "../api/config";

export default function Home() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruitments = async () => {
      setLoading(true);
      try {
        const res = await api.get<Recruitment[]>("/recruitments");
        const parsed = res.data.map((r) => ({
          ...r,
          deadline: new Date(r.deadline),
        }));
        setRecruitments(parsed);
      } catch (err: unknown) {
        console.error("Lỗi tải danh sách tuyển dụng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruitments();
  }, []);

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );

  return (
    <div className="p-6 mx-[20px]">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        Danh sách tuyển dụng
      </h1>

      <Row gutter={[24, 24]}>
        {recruitments.map((job) => {
          const isExpired = dayjs(job.deadline).isBefore(dayjs());

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={job.id}>
              <div className="h-full flex flex-col">
                <Card
                  hoverable
                  style={{
                    border: "none",
                    borderRadius: "1rem",
                    height: "100%",
                  }}
                  styles={{
                    body: {
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    },
                  }}
                  className="rounded-3xl border border-gray-200 shadow-lg overflow-hidden transition-transform bg-white hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {job.title}
                    </h2>
                    {isExpired ? (
                      <Tag color="red">Hết hạn</Tag>
                    ) : (
                      <Tag color="green">Đang tuyển</Tag>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-2 mb-4 flex-grow">
                    <p>
                      <strong>Địa điểm:</strong> {job.location}
                    </p>
                    <p>
                      <strong>Mức lương:</strong> {job.salary}
                    </p>
                    <p>
                      <strong>Hạn nộp:</strong>{" "}
                      {dayjs(job.deadline).format("DD-MM-YYYY")}
                    </p>
                  </div>

                  <Link to={`/recruitment/${job.id}`}>
                    <Button type="primary" block size="middle">
                      Xem chi tiết
                    </Button>
                  </Link>
                </Card>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
