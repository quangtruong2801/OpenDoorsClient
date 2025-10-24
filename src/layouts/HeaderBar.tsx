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
} from "@ant-design/icons";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { useBreakpoint } = Grid;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onMenuClick?: () => void; //prop mở Drawer trên mobile
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

  const handleLogout = () => {
    logout();
    msgApi.success("Đã đăng xuất!");
    navigate("/");
  };

  const menuItems = [
    {
      key: "1",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
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
          {/* Hiển thị icon menu nếu là mobile */}
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={onMenuClick}
              style={{ color: token.colorText }}
            />
          ) : (
            // Hiển thị nút collapse sidebar nếu là desktop
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

        {/* bên phải: dark mode + user */}
        <Space size="large" align="center">
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="🌞"
            checked={isDark}
            onChange={setIsDark}
          />

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
                {/* Ẩn tên người dùng trên mobile để tiết kiệm chỗ */}
                {!isMobile && (
                  <span className="font-medium">{user.name}</span>
                )}
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
          )}
        </Space>
      </Header>
    </>
  );
}
