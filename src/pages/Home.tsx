import { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Spin, Button, Tag } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api/config";
import type { Recruitment } from "../types/Recruitment";

interface RecruitmentResponse {
  data: Recruitment[];
  total: number;
}

export default function Home() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 6;

  const fetchRecruitments = useCallback(async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await api.get<RecruitmentResponse>("/recruitments/filter", {
        params: { page: pageNumber, pageSize: limit },
      });

      const newItems: Recruitment[] = res.data.data.map((r: Recruitment) => ({
        ...r,
        deadline: new Date(r.deadline),
      }));

      setRecruitments((prev) => {
        const ids = new Set(prev.map((r) => r.id));
        const filtered = newItems.filter((r) => !ids.has(r.id));
        return [...prev, ...filtered];
      });

      if (pageNumber * limit >= res.data.total) setHasMore(false);
    } catch (err) {
      console.error("Lỗi tải danh sách tuyển dụng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMore) fetchRecruitments(page);
  }, [page, fetchRecruitments, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + viewportHeight >= fullHeight - 200) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="p-6 mx-[20px] min-h-screen pb-20">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        Danh sách tuyển dụng
      </h1>

      <Row gutter={[24, 24]}>
        {recruitments.map((job) => {
          const isExpired = dayjs(job.deadline).isBefore(dayjs());

          return (
            <Col xs={24} sm={12} md={8} key={job.id}>
              <div className="h-full flex flex-col">
                <Card
                  hoverable
                  style={{ border: "none", borderRadius: "1rem", height: "100%" }}
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

      {loading && <Spin size="large" style={{ display: "block", margin: "20px auto" }} />}

      {!hasMore && (
        <p className="text-center text-gray-500" style={{ marginTop: "60px" }}>
          Bạn đã xem hết danh sách tuyển dụng
        </p>
      )}
    </div>
  );
}
