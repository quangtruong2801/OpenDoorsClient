import { Menu, theme } from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  SolutionOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import openIcon from "../assets/logoVNTT1.png";
import closeIcon from "../assets/logoVNTT2.png";
import { useAuth } from "../context/useAuth";
import { useTranslation } from "react-i18next";

interface SideBarProps {
  collapsed: boolean;
}

export default function SideBar({ collapsed }: SideBarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  // --- Menu items ---
  const adminItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">{t("home")}</Link>,
    },
    {
      key: "team",
      icon: <TeamOutlined />,
      label: t("team"),
      children: [
        {
          key: "/team/member",
          label: <Link to="/team/member">{t("team_member_management")}</Link>,
        },
        {
          key: "/team/management",
          label: <Link to="/team/management">{t("team_management")}</Link>,
        },
      ],
    },
    {
      key: "job",
      icon: <SolutionOutlined />,
      label: t("job"),
      children: [
        {
          key: "/job/management",
          label: <Link to="/job/management">{t("job_management")}</Link>,
        },
      ],
    },
    {
      key: "recruitment",
      icon: <IdcardOutlined />,
      label: t("recruitment"),
      children: [
        {
          key: "/recruitments",
          label: <Link to="/recruitments">{t("recruitment_list")}</Link>,
        },
        {
          key: "/recruitment/management",
          label: (
            <Link to="/recruitment/management">{t("recruitment_management")}</Link>
          ),
        },
        {
          key: "/application/management",
          label: (
            <Link to="/application/management">{t("application_management")}</Link>
          ),
        },
      ],
    },
  ];

  const userItems = [
    {
      key: "/recruitments",
      icon: <IdcardOutlined />,
      label: <Link to="/recruitments">{t("recruitment")}</Link>,
    },
  ];

  const guestItems = [
    {
      key: "/recruitments",
      icon: <IdcardOutlined />,
      label: <Link to="/recruitments">{t("recruitment")}</Link>,
    },
  ];

  // --- Chọn menu theo role ---
  const items = user?.role === "admin" ? adminItems : user ? userItems : guestItems;

  return (
    <div
      className="h-screen transition-colors duration-300"
      style={{
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
      }}
    >
      {/* Logo */}
      <div className="w-full h-12 mb-4 flex items-center justify-center">
        {!collapsed ? (
          <img
            src={openIcon}
            alt="Open"
            className="w-3/4 h-full object-contain"
          />
        ) : (
          <img
            src={closeIcon}
            alt="Close"
            className="w-10 h-10 object-contain"
          />
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        style={{
          backgroundColor: "transparent",
          borderInlineEnd: "none",
        }}
      />
    </div>
  );
}
