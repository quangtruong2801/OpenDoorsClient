import { Menu } from "antd";
import { TeamOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import openIcon from "../assets/logoVNTT1.png";
import closeIcon from "../assets/logoVNTT2.png";

export default function SideBar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();

  const items = [
    { key: "/", icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: "Team",
      children: [
        {
          key: "/team/member",
          label: <Link to="/team/member">Team Members</Link>,
        },
        {
          key: "/team/management",
          label: <Link to="/team/management">Team Management</Link>,
        },
      ],
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Cài đặt</Link>,
    },
  ];

  return (
    <div className="h-screen">
      <div className="w-full h-12 mb-4">
        {!collapsed ? (
          <img
            src={openIcon}
            alt="Open"
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={closeIcon}
            alt="Close"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        // defaultOpenKeys={["team"]}
        items={items}
      />
    </div>
  );
}
