import { Layout, Button, Switch, Dropdown, message } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth"; // hook AuthContext
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function HeaderBar({ collapsed, setCollapsed }: HeaderBarProps) {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Theme effect
  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất!");
    navigate("/");
  };

  const items = [
    {
      key: "1",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="shadow flex items-center justify-between px-4 bg-[var(--color-header)] text-white">
      {/* Nút thu gọn sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        className="!text-[var(--color-text)]"
      />

      <div className="flex items-center gap-4">
        {/* Dark/Light mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isDark ? "Dark" : "Light"} Mode
          </span>
          <Switch
            checkedChildren="🌙"
            unCheckedChildren="🌞"
            checked={isDark}
            onChange={setIsDark}
          />
        </div>

        {/* User login/logout */}
        {user ? (
          <Dropdown menu={{ items }} placement="bottomRight">
            <Button
              icon={<UserOutlined />}
              type="text"
              className="!text-[var(--color-text)]"
            >
              {user.name}
            </Button>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate("/login")}>
            Đăng nhập
          </Button>
        )}
      </div>
    </Header>
  );
}
