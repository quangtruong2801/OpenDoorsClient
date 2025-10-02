import { Layout, Button, Switch } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const { Header } = Layout;

export default function HeaderBar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  // Lấy theme từ localStorage hoặc mặc định là light
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // Khi theme thay đổi → gán vào html & lưu vào localStorage
  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);

  return (
    <Header className="shadow flex items-center justify-between px-4 bg-[var(--color-header)] text-white">
      {/* Nút thu gọn sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        className="!text-[var(--color-text)]"
      />

      {/* Chuyển Dark/Light */}
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
    </Header>
  );
}
