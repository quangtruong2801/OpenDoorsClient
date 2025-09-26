import { Input, Select, Space } from "antd";

const { Option } = Select;

interface TeamFilterProps {
  search: string;
  memberFilter: string;
  dateFilter: string;
  onSearchChange: (v: string) => void;
  onMemberFilterChange: (v: string) => void;
  onDateFilterChange: (v: string) => void;
}

export default function TeamFilter({
  search,
  memberFilter,
  dateFilter,
  onSearchChange,
  onMemberFilterChange,
  onDateFilterChange,
}: TeamFilterProps) {
  return (
    <Space size="middle">
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
      <Select
        value={dateFilter || undefined}
        onChange={onDateFilterChange}
        style={{ width: 160 }}
      >
        <Option value="all">All time</Option>
        <Option value="7d">Last 7 days</Option>
        <Option value="30d">Last 30 days</Option>
        <Option value="1y">Last 1 year</Option>
      </Select>
    </Space>
  );
}
