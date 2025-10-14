import { Layout } from "antd";
import { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import HeaderBar from "./HeaderBar";

const { Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export default function MainLayout({ children, isDark, setIsDark }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored ? stored === "true" : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  return (
    <Layout className="min-h-screen">
      <Sider collapsible collapsed={collapsed} trigger={null} width={220}>
        <Sidebar collapsed={collapsed} />
      </Sider>

      <Layout className="flex flex-col min-h-screen">
        <HeaderBar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isDark={isDark}
          setIsDark={setIsDark}
        />
        <Content className="p-6 flex-1 overflow-auto">{children}</Content>
      </Layout>
    </Layout>
  );
}
