import { Layout } from "antd";
import { useState } from "react";
import Sidebar from "./SideBar";
import HeaderBar from "./HeaderBar";

const { Content, Sider } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sider collapsible collapsed={collapsed} trigger={null}>
        <Sidebar collapsed={collapsed} />
      </Sider>

      <Layout className="flex flex-col min-h-screen">
        <HeaderBar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 flex-1 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}
