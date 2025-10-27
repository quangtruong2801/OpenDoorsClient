import { useEffect, useState, useContext, useCallback } from "react";
import { Card, Row, Col, Spin, theme, message, Pagination } from "antd";
import axios from "axios";
import api from "~/api/config";
import type { Member } from "~/types/Member";
import AuthContext from "~/context/AuthContext";
import MemberDetailModal from "~/components/MemberDetailModal";

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();
  const [msgApi, contextHolder] = message.useMessage();

  const auth = useContext(AuthContext);
  const user = auth?.user;

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // Modal chi tiết
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Hàm gọi API
  const fetchMemberData = useCallback(
    async (userId: string, signal: AbortSignal, page = 1) => {
      try {
        setLoading(true);

        // Lấy thông tin cá nhân
        const meRes = await api.get<Member>(`/members/${userId}`, { signal });
        const me = meRes.data;
        setCurrentMember(me);

        if (me.teamId) {
          // Lấy danh sách member theo team, theo page
          const teamRes = await api.get<{ data: Member[]; total: number }>(
            "/members/filter",
            {
              params: { teamId: me.teamId, page, pageSize },
              signal,
            }
          );
          setMembers(teamRes.data.data);
          setTotal(teamRes.data.total);
        } else {
          setMembers([]);
          setTotal(0);
        }
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;
        console.error("Lỗi tải dữ liệu:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            msgApi.error("Bạn chưa đăng nhập hoặc token đã hết hạn.");
          } else {
            msgApi.error("Không thể tải danh sách thành viên.");
          }
        } else {
          msgApi.error("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setLoading(false);
      }
    },
    [msgApi, pageSize]
  );

  // useEffect gọi khi user.id hoặc page thay đổi
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    fetchMemberData(user.id, controller.signal, page);

    return () => controller.abort();
  }, [user?.id, page, fetchMemberData]);

  return (
    <div style={{ background: token.colorBgBase, minHeight: "100vh" }}>
      {contextHolder}

      {/* Header */}
      <div
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          textAlign: "center",
          color: "#fff",
          padding: "100px 20px 80px",
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          {currentMember?.team || "My Team"}
        </h1>
        <p
          style={{
            fontSize: 18,
            opacity: 0.9,
            maxWidth: 700,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Cùng nhau xây dựng một tập thể năng động, sáng tạo và gắn kết — nơi
          mọi thành viên đều đóng góp giá trị.
        </p>
      </div>

      {/* Team Members */}
      <div style={{ padding: "60px 40px" }}>
        {loading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "60px auto" }}
          />
        ) : members.length > 0 ? (
          <>
            <Row gutter={[32, 32]} justify="center">
              {members.map((member) => (
                <Col xs={24} sm={12} md={8} lg={6} key={member.id}>
                  <Card
                    hoverable
                    onClick={() => {
                      setSelectedMember(member);
                      setDetailModalOpen(true);
                    }}
                    style={{
                      height: 340,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow:
                        "0 4px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
                      textAlign: "center",
                      background: token.colorBgContainer,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    className="hover:shadow-lg hover:-translate-y-2"
                    cover={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          padding: "40px 0 20px",
                          background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryBg})`,
                        }}
                      >
                        <img
                          src={member.avatar}
                          alt={member.name}
                          style={{
                            width: 110,
                            height: 110,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "4px solid #fff",
                            boxShadow: "0 0 0 3px rgba(255,255,255,0.4)",
                          }}
                        />
                      </div>
                    }
                  >
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: token.colorTextHeading,
                        marginBottom: 4,
                      }}
                    >
                      {member.name}
                    </h3>

                    <p
                      style={{
                        fontSize: 13,
                        color: token.colorTextSecondary,
                        marginBottom: 8,
                      }}
                    >
                      {member.jobType && member.jobType.length > 0
                        ? member.jobType.join(", ")
                        : "Chưa có vị trí"}
                    </p>

                    <p
                      style={{
                        fontSize: 13,
                        color: token.colorTextSecondary,
                        marginBottom: 0,
                      }}
                    >
                      {member.team || "Không thuộc team nào"}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {total > pageSize && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: "center", color: token.colorTextSecondary }}>
            Không có thành viên nào trong team.
          </p>
        )}
      </div>

      {/* Modal chi tiết */}
      <MemberDetailModal
        open={detailModalOpen}
        member={selectedMember}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedMember(null);
        }}
      />
    </div>
  );
}
