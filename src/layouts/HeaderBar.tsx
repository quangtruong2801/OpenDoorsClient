import {
  Layout,
  Button,
  Switch,
  Dropdown,
  message,
  theme,
  Avatar,
  Space,
  Grid,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  GlobalOutlined, // thêm icon quả địa cầu
} from "@ant-design/icons";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Header } = Layout;
const { useBreakpoint } = Grid;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onMenuClick?: () => void;
}

export default function HeaderBar({
  collapsed,
  setCollapsed,
  isDark,
  setIsDark,
  onMenuClick,
}: HeaderBarProps) {
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [msgApi, contextHolder] = message.useMessage();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    msgApi.success(t("logout"));
    navigate("/");
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    msgApi.success(lang === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English");
  };

  const languageMenu = {
    items: [
      {
        key: "vi",
        label: "Tiếng Việt",
        onClick: () => changeLanguage("vi"),
      },
      {
        key: "en",
        label: "English",
        onClick: () => changeLanguage("en"),
      },
    ],
  };

  const menuItems = [
    {
      key: "1",
      icon: <LogoutOutlined />,
      label: t("logout"),
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {contextHolder}
      <Header
        className="flex items-center justify-between px-4 transition-colors duration-300"
        style={{
          background: token.colorBgContainer,
          color: token.colorText,
          boxShadow: token.boxShadowSecondary,
          paddingLeft: 0,
        }}
      >
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={onMenuClick}
              style={{ color: token.colorText }}
            />
          ) : (
            <Button
              type="text"
              icon={
                collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: token.colorText }}
            />
          )}
        </div>

        <Space size="large" align="center">
          {/* Nút chọn ngôn ngữ */}
          <Dropdown menu={languageMenu} placement="bottomRight" arrow>
            <Button
              icon={<GlobalOutlined />}
              type="text"
              style={{ color: token.colorText }}
            >
              {i18n.language === "vi" ? "VN" : "EN"}
            </Button>
          </Dropdown>

          {/* Dark/Light Mode */}
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="🌞"
            checked={isDark}
            onChange={setIsDark}
          />

          {/* User */}
          {user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
              <Space className="cursor-pointer select-none">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: token.colorPrimary,
                    color: token.colorWhite,
                  }}
                />
                {!isMobile && (
                  <span className="font-medium">{user.name}</span>
                )}
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate("/login")}>
              {t("login")}
            </Button>
          )}
        </Space>
      </Header>
    </>
  );
}
