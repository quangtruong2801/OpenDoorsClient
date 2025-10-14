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

  const siderWidth = collapsed ? 80 : 220;
  const headerHeight = 64; 

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar cố định */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflow: "auto",
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* Layout chính */}
      <Layout
        style={{
          marginLeft: siderWidth,
          minHeight: "100vh",
        }}
      >
        {/* Header cố định */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: siderWidth,
            right: 0,
            zIndex: 100,
          }}
        >
          <HeaderBar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isDark={isDark}
            setIsDark={setIsDark}
          />
        </div>

        {/* Content scrollable */}
        <Content
          style={{
            marginTop: headerHeight, // bù header
            padding: 24,
            overflow: "auto",
            background: "var(--ant-layout-background)",
            minHeight: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
