import { Layout } from "antd";
import { useState } from "react";
import Sidebar from "./SideBar";
import HeaderBar from "./HeaderBar";

const { Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        // className="bg-white shadow-md"
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* Main content */}
      <Layout className="flex flex-col min-h-screen">
        <HeaderBar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 flex-1 overflow-auto bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
