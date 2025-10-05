import { Menu } from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  SettingOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import openIcon from "../assets/logoVNTT1.png";
import closeIcon from "../assets/logoVNTT2.png";
import { useAuth } from "../context/useAuth";

export default function SideBar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const { user } = useAuth();

  // Menu full cho admin
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
        { key: "/team/member", label: <Link to="/team/member">Team Members</Link> },
        { key: "/team/management", label: <Link to="/team/management">Team Management</Link> },
      ],
    },
    {
      key: "job",
      icon: <SolutionOutlined />,
      label: "Job",
      children: [
        { key: "/job/management", label: <Link to="/job/management">Job Management</Link> },
      ],
    },
    {
      key: "recruitment",
      icon: <SolutionOutlined />,
      label: "Recruitment",
      children: [
        { key: "/recruitment/management", label: <Link to="/recruitment/management">Quản lý tin tuyển dụng</Link> },
        // { key: "/recruitments", label: <Link to="/recruitments">Trang tuyển dụng</Link> },
      ],
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Cài đặt</Link>,
    },
  ];

  // Menu cho user thường / chưa login
  const userItems = [
    { key: "/", icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
    // { key: "/recruitments", icon: <SolutionOutlined />, label: <Link to="/recruitments">Trang tuyển dụng</Link> },
  ];

  const items = user?.role === "admin" ? adminItems : userItems;

  return (
    <div className="h-screen">
      <div className="w-full h-12 mb-4">
        {!collapsed ? (
          <img src={openIcon} alt="Open" className="w-full h-full object-contain" />
        ) : (
          <img src={closeIcon} alt="Close" className="w-full h-full object-contain" />
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        // defaultOpenKeys={["team", "job", "recruitment"]}
        items={items}
      />
    </div>
  );
}
