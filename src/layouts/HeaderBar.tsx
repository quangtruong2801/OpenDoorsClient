import { Layout, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Header } = Layout;

export default function HeaderBar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  return (
    <Header  className="shadow flex items-center justify-between px-4 bg-white">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />
    </Header>
  );
}
