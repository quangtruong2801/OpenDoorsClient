import { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Spin, Button, Tag, theme } from "antd";
import { Link } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";
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
  const { token } = theme.useToken(); // Lấy token từ ConfigProvider

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
    <div
      style={{
        background: token.colorBgBase,
        color: token.colorText,
        padding: 24,
        minHeight: "100vh",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 32,
          color: token.colorPrimary,
        }}
      >
        Danh sách tuyển dụng
      </h1>

      <Row gutter={[24, 24]}>
        {recruitments.map((job) => {
          const isExpired = dayjs(job.deadline).isBefore(dayjs());

          return (
            <Col xs={24} sm={12} md={8} key={job.id}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  background: token.colorBgContainer,
                  color: token.colorText,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowTertiary,
                  transition: "transform 0.3s",
                }}
                className="hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2
                    style={{
                      color: token.colorTextHeading,
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    {job.title}
                  </h2>
                  {isExpired ? (
                    <Tag color="red">Hết hạn</Tag>
                  ) : (
                    <Tag color="green">Đang tuyển</Tag>
                  )}
                </div>

                <div style={{ fontSize: 14, lineHeight: 1.7 }}>
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
                  <Button
                    type="primary"
                    block
                    size="middle"
                    style={{
                      marginTop: 16,
                      backgroundColor: token.colorPrimary,
                      borderColor: token.colorPrimary,
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </Link>
              </Card>
            </Col>
          );
        })}
      </Row>

      {hasMore && !loading && (
        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            color: token.colorTextSecondary,
            animation: "bounce 1.5s infinite",
          }}
        >
          <DownOutlined style={{ fontSize: 24 }} />
        </div>
      )}

      {loading && (
        <Spin
          size="large"
          style={{
            display: "block",
            margin: "24px auto",
            color: token.colorText,
          }}
        />
      )}

      {!hasMore && (
        <p
          style={{
            textAlign: "center",
            marginTop: 60,
            color: token.colorTextSecondary,
          }}
        >
          Bạn đã xem hết danh sách tuyển dụng
        </p>
      )}
    </div>
  );
}
