import { Input, Select, Space } from "antd";

const { Option } = Select;

interface TeamFilterProps {
  search: string;
  memberFilter: string;
  onSearchChange: (v: string) => void;
  onMemberFilterChange: (v: string) => void;
}

export default function TeamFilter({
  search,
  memberFilter,
  onSearchChange,
  onMemberFilterChange,
}: TeamFilterProps) {
  return (
    <Space size="middle" className="flex flex-wrap w-full gap-4">
      <Input
        placeholder="Search team..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 200 }}
      />
      <Select
        placeholder="Chọn số lượng thành viên"
        value={memberFilter || undefined}
        onChange={onMemberFilterChange}
        style={{ width: 160 }}
      >
        {/* <Option value="all">Tất cả thành viên</Option> */}
        <Option value="lt5">Dưới 5 thành viên</Option>
        <Option value="5to10">Từ 5 - 10 thành viên</Option>
        <Option value="gt10">Trên 10 thành viên</Option>
      </Select>
    </Space>
  );
}
