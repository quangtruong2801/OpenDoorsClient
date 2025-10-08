import { Input, Select, Space, Button } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { FC } from "react";
type MemberFilterProps = {
  filters: { search: string; type: string; jobType: string; teamId: string };
  jobList: { id: string; jobName: string }[];
  teamList: { id: string; teamName: string }[];
  onChange: (newFilters: Partial<MemberFilterProps["filters"]>) => void;
  onReset: () => void;
};
const MemberFilter: FC<MemberFilterProps> = ({
  filters,
  jobList,
  teamList,
  onChange,
  onReset,
}) => {
  return (
    <Space wrap>
      <Input
        placeholder="Tìm theo tên"
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        style={{ width: 200 }}
      />
      <Select
        placeholder="Chọn hình thức"
        value={filters.type || undefined}
        onChange={(v) => onChange({ type: v || "" })}
        allowClear
        style={{ width: 150 }}
      >
        <Select.Option value="fulltime">Full Time</Select.Option>
        <Select.Option value="parttime">Part Time</Select.Option>
        <Select.Option value="intern">Intern</Select.Option>
      </Select>
      <Select
        placeholder="Chọn công việc"
        value={filters.jobType || undefined}
        onChange={(v) => onChange({ jobType: v || "" })}
        allowClear
        style={{ width: 160 }}
      >
        {jobList.map((j, index) => (
          <Select.Option key={j.id || `job-${index}`} value={j.jobName}>
            {j.jobName}
          </Select.Option>
        ))}
      </Select>
      <Select
        placeholder="Chọn team"
        value={filters.teamId || undefined}
        onChange={(v) => onChange({ teamId: v || "" })}
        allowClear
        style={{ width: 160 }}
      >
        {teamList.map((t, index) => (
          <Select.Option key={t.id || `team-${index}`} value={t.id}>
            {t.teamName}
          </Select.Option>
        ))}
      </Select>
      <Button icon={<ReloadOutlined />} onClick={onReset} />{" "}
    </Space>
  );
};
export default MemberFilter;
