import { useEffect, useState, useContext, useCallback } from "react";
import { Card, Row, Col, Spin, theme, message, Tag } from "antd";
import axios from "axios";
import api from "~/api/config";
import type { Member } from "~/types/Member";
import AuthContext from "~/context/AuthContext";

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();
  const [msgApi, contextHolder] = message.useMessage();

  const auth = useContext(AuthContext);
  const user = auth?.user;

  // Hàm gọi API được memo hóa để tránh gọi lại không cần thiết
  const fetchMemberData = useCallback(async (userId: string, signal: AbortSignal) => {
    try {
      setLoading(true);
      // Lấy thông tin cá nhân (Member)
      const meRes = await api.get<Member>(`/members/${userId}`, { signal });
      const me = meRes.data;
      setCurrentMember(me);

      // Nếu có teamId => lấy danh sách thành viên trong team
      if (me.teamId) {
        const teamRes = await api.get<{ data: Member[] }>("/members/filter", {
          params: { teamId: me.teamId },
          signal,
        });
        setMembers(teamRes.data.data);
      } else {
        setMembers([]);
      }
    } catch (err: unknown) {
      if (axios.isCancel(err)) return; // bị hủy => không xử lý
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
  }, [msgApi]);

  // useEffect chỉ gọi lại khi user.id thay đổi
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    fetchMemberData(user.id, controller.signal);

    return () => controller.abort(); // cleanup khi unmount
  }, [user?.id, fetchMemberData]);

  return (
    <div style={{ background: token.colorBgBase, minHeight: "100vh" }}>
      {contextHolder}

      {/* Header / Hero */}
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
          Cùng nhau xây dựng một tập thể năng động, sáng tạo và gắn kết — nơi mọi
          thành viên đều đóng góp giá trị.
        </p>
      </div>

      {/* Team Members */}
      <div style={{ padding: "60px 40px" }}>
        {loading ? (
          <Spin size="large" style={{ display: "block", margin: "60px auto" }} />
        ) : members.length > 0 ? (
          <Row gutter={[32, 32]} justify="center">
            {members.map((member) => (
              <Col xs={24} sm={12} md={8} lg={6} key={member.id}>
                <Card
                  hoverable
                  variant="borderless"
                  style={{
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
                  <div style={{ marginBottom: 12 }}>
                    {(member.jobType || []).map((job) => (
                      <Tag
                        key={job}
                        color={token.colorPrimary}
                        style={{
                          borderRadius: 12,
                          padding: "2px 10px",
                          fontSize: 12,
                        }}
                      >
                        {job}
                      </Tag>
                    ))}
                    {!member.jobType?.length && (
                      <Tag color="default">Chưa có vị trí</Tag>
                    )}
                  </div>
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
        ) : (
          <p style={{ textAlign: "center", color: token.colorTextSecondary }}>
            Không có thành viên nào trong team.
          </p>
        )}
      </div>
    </div>
  );
}
