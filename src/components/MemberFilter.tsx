import { Input, Select, Space } from "antd";
import type { Management } from "../types/Management";

const { Option } = Select;

interface MemberFilterProps {
  search: string;
  type: string;
  jobType: string;
  teamId: string;
  jobList: { id?: string; jobName?: string }[]; // id hoặc jobName có thể undefined
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
  teamId,
  jobList,
  teamList,
  onSearchChange,
  onTypeChange,
  onJobTypeChange,
  onTeamChange,
}: MemberFilterProps) {
  return (
    <Space size="middle" className="flex flex-wrap w-full gap-4">
      {/* Search */}
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[180px]"
      />

      {/* Type Filter */}
      <Select
        placeholder="Select Type"
        value={type || undefined}
        onChange={onTypeChange}
        allowClear
        className="flex-1 min-w-[150px]"
      >
        <Option key="type-fulltime" value="fulltime">
          Full Time
        </Option>
        <Option key="type-parttime" value="parttime">
          Part Time
        </Option>
        <Option key="type-intern" value="intern">
          Intern
        </Option>
      </Select>

      {/* Job Filter */}
      <Select
        placeholder="Select Job Type"
        value={jobType || undefined}
        onChange={onJobTypeChange}
        allowClear
        className="flex-1 min-w-[150px]"
      >
        {jobList.map((j, index) => (
          <Option
            key={j.id ?? `job-${index}`} // fallback nếu id undefined
            value={j.jobName ?? `job-${index}`} // fallback nếu jobName undefined
          >
            {j.jobName ?? `Job ${index + 1}`}
          </Option>
        ))}
      </Select>

      {/* Team Filter */}
      <Select
        placeholder="Select Team"
        value={teamId || undefined}
        onChange={onTeamChange}
        allowClear
        className="flex-1 min-w-[180px]"
      >
        {teamList.map((t, index) => (
          <Option
            key={t.id ?? `team-${index}`} // fallback nếu id undefined
            value={t.id ?? `team-${index}`}
          >
            {t.teamName ?? `Team ${index + 1}`}
          </Option>
        ))}
      </Select>
    </Space>
  );
}
