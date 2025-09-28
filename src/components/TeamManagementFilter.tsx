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
        value={memberFilter || undefined}
        onChange={onMemberFilterChange}
        style={{ width: 160 }}
      >
        <Option value="all">All members</Option>
        <Option value="lt5">Below 5</Option>
        <Option value="5to10">5 - 10</Option>
        <Option value="gt10">Above 10</Option>
      </Select>
    </Space>
  );
}
