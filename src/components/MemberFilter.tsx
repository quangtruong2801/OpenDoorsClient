import { Input, Select, Space } from "antd";
import type { Management } from "../types/Management";

const { Option } = Select;

interface MemberFilterProps {
  filters: {
    search: string;
    type: string;
    jobType: string;
    team: string;
  };
  jobList: { id?: string; jobName?: string }[];
  teamList: Management[];
  onChange: (filters: { search: string; type: string; jobType: string; team: string }) => void;
}

export default function MemberFilter({ filters, jobList, teamList, onChange }: MemberFilterProps) {
  const handleChange = (key: keyof typeof filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Space size="middle" className="flex flex-wrap w-full gap-4">
      <Input
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => handleChange("search", e.target.value)}
        className="flex-1 min-w-[180px]"
      />

      <Select
        placeholder="Select Type"
        value={filters.type || undefined}
        onChange={(v) => handleChange("type", v)}
        allowClear
        className="flex-1 min-w-[150px]"
      >
        <Option value="fulltime">Full Time</Option>
        <Option value="parttime">Part Time</Option>
        <Option value="intern">Intern</Option>
      </Select>

      <Select
        placeholder="Select Job Type"
        value={filters.jobType || undefined}
        onChange={(v) => handleChange("jobType", v)}
        allowClear
        className="flex-1 min-w-[150px]"
      >
        {jobList.map((j, idx) => (
          <Option key={j.id ?? `job-${idx}`} value={j.jobName ?? `job-${idx}`}>
            {j.jobName ?? `Job ${idx + 1}`}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Select Team"
        value={filters.team || undefined}
        onChange={(v) => handleChange("team", v)}
        allowClear
        className="flex-1 min-w-[180px]"
      >
        {teamList.map((t, idx) => (
          <Option key={t.id ?? `team-${idx}`} value={t.id ?? `team-${idx}`}>
            {t.teamName ?? `Team ${idx + 1}`}
          </Option>
        ))}
      </Select>
    </Space>
  );
}
