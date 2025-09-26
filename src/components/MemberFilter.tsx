import { Input, Select, Space } from "antd";
import type { Management } from "../types/Management";

const { Option } = Select;

interface MemberFilterProps {
  search: string;
  type: string;
  jobType: string;
  team: string;
  teamList: Management[];
  onSearchChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onJobTypeChange: (v: string) => void;
  onTeamChange: (v: string) => void;
}

export default function MemberFilter({
  search,
  type,
  jobType,
  team,
  teamList,
  onSearchChange,
  onTypeChange,
  onJobTypeChange,
  onTeamChange,
}: MemberFilterProps) {
  return (
    <Space
      size="middle"
      className="flex flex-wrap w-full gap-4" // 📌 cho phép xuống dòng và chiếm toàn chiều rộng
    >
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[180px]" // 📌 co giãn linh hoạt, có giới hạn tối thiểu
      />

      <Select
        placeholder="Select Type"
        value={type || undefined}
        onChange={onTypeChange}
        allowClear
        className="flex-1 min-w-[150px]"
      >
        <Option value="fulltime">Full Time</Option>
        <Option value="parttime">Part Time</Option>
      </Select>

      <Select
        placeholder="Select Job Type"
        value={jobType || undefined}
        onChange={onJobTypeChange}
        allowClear
        className="flex-1 min-w-[150px]"
      >
        <Option value="dev">Developer</Option>
        <Option value="design">Designer</Option>
      </Select>

      <Select
        placeholder="Select Team"
        value={team || undefined}
        onChange={onTeamChange}
        allowClear
        className="flex-1 min-w-[180px]"
      >
        {teamList.map((t) => (
          <Option key={t.id} value={t.teamName}>
            {t.teamName}
          </Option>
        ))}
      </Select>
    </Space>
  );
}
