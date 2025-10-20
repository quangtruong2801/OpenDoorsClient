import { Menu, theme } from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  // SettingOutlined,
  SolutionOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import openIcon from "../assets/logoVNTT1.png";
import closeIcon from "../assets/logoVNTT2.png";
import { useAuth } from "../context/useAuth";

export default function SideBar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const { user } = useAuth();
  const { token } = theme.useToken(); // Lấy màu theme hiện tại

  const adminItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: "Team",
      children: [
        { key: "/team/member", label: <Link to="/team/member">Quản lí thành viên</Link> },
        { key: "/team/management", label: <Link to="/team/management">Quản lí Team</Link> },
      ],
    },
    {
      key: "job",
      icon: <SolutionOutlined />,
      label: "Công việc",
      children: [
        { key: "/job/management", label: <Link to="/job/management">Quản lí công việc</Link> },
      ],
    },
    {
      key: "recruitment",
      icon: <IdcardOutlined />,
      label: "Tuyển dụng",
      children: [
        { key: "/recruitment/management", label: <Link to="/recruitment/management">Quản lý tin tuyển dụng</Link> },
        { key: "/application/management", label: <Link to="/application/management">Quản lý đơn ứng tuyển</Link> },
      ],
    },
    // {
    //   key: "/settings",
    //   icon: <SettingOutlined />,
    //   label: <Link to="/settings">Cài đặt</Link>,
    // },
  ];

  const userItems = [
    { key: "/", icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
  ];

  const items = user?.role === "admin" ? adminItems : userItems;

  return (
    <div
      className="h-screen transition-colors duration-300"
      style={{
        backgroundColor: token.colorBgContainer, // Nền đồng bộ theo theme
        color: token.colorText, // Chữ đổi màu tự động
      }}
    >
      <div className="w-full h-12 mb-4 flex items-center justify-center">
        {!collapsed ? (
          <img src={openIcon} alt="Open" className="w-3/4 h-full object-contain" />
        ) : (
          <img src={closeIcon} alt="Close" className="w-10 h-10 object-contain" />
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        style={{
          backgroundColor: "transparent", // Giữ nền khớp với div cha
          borderInlineEnd: "none", // Loại bỏ viền dọc
        }}
      />
    </div>
  );
}
