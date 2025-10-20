import { Layout, Grid, Drawer } from "antd";
import { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import HeaderBar from "./HeaderBar";

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

interface MainLayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export default function MainLayout({
  children,
  isDark,
  setIsDark,
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored ? stored === "true" : false;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();

  const siderWidth = collapsed ? 80 : 220;
  const headerHeight = 64;

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  // Tablet tự động collapse sidebar
  useEffect(() => {
    if (isTablet) setCollapsed(true);
  }, [isTablet]);

  // Lưu trạng thái collapse
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar cố định (ẩn trên mobile) */}
      {!isMobile && (
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
            transition: "all 0.2s ease",
          }}
        >
          <Sidebar collapsed={collapsed} />
        </Sider>
      )}

      {/* Drawer menu trên mobile */}
      <Drawer
        open={drawerOpen}
        placement="left"
        width={220}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar collapsed={false} />
      </Drawer>

      {/* Khu vực chính */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : siderWidth,
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
          // background: "var(--ant-layout-bg, #f5f5f5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: isMobile ? 0 : siderWidth,
            right: 0,
            height: headerHeight,
            zIndex: 100,
            transition: "left 0.2s ease",
          }}
        >
          <HeaderBar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isDark={isDark}
            setIsDark={setIsDark}
            onMenuClick={() => setDrawerOpen(true)}
          />
        </div>

        {/* Content */}
        <Content
          style={{
            marginTop: headerHeight,
            padding: "24px",
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
