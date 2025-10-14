import { Layout, Button, Switch, Dropdown, message, theme, Avatar, Space } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export default function HeaderBar({
  collapsed,
  setCollapsed,
  isDark,
  setIsDark,
}: HeaderBarProps) {
  const { token } = theme.useToken(); // Lấy màu hiện tại từ AntD theme
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất!");
    navigate("/");
  };

  const items = [
    {
      key: "1",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="flex items-center justify-between px-4 transition-colors duration-300"
      style={{
        background: token.colorBgContainer, // Đồng bộ màu nền
        color: token.colorText, // Chữ tự đổi theo theme
        boxShadow: token.boxShadowSecondary, // Bóng đổ chuẩn AntD
        paddingLeft: 0,
      }}
    >
      {/* Nút thu gọn Sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          color: token.colorText, // Icon theo theme
        }}
      />

      {/* Nhóm chức năng bên phải */}
      <Space size="large" align="center">
        {/* Nút Dark / Light mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium select-none">
            {isDark ? "Dark" : "Light"} Mode
          </span>
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="🌞"
            checked={isDark}
            onChange={setIsDark}
          />
        </div>

        {/* Dropdown User */}
        {user ? (
          <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <Space className="cursor-pointer">
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{
                  backgroundColor: token.colorPrimary,
                  color: token.colorWhite,
                }}
              />
              <span className="font-medium">{user.name}</span>
            </Space>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate("/login")}>
            Đăng nhập
          </Button>
        )}
      </Space>
    </Header>
  );
}
