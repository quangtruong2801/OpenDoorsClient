import type { FC } from "react";
import { Input, Select, Space, Button } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

type RecruitmentFilterProps = {
  filters: {
    search: string;
    location: string;
    salary: string;
  };
  locations: string[];
  salaries: string[];
  onChange: (newFilters: Partial<RecruitmentFilterProps["filters"]>) => void;
  onReset: () => void;
};

const RecruitmentFilter: FC<RecruitmentFilterProps> = ({
  filters,
  locations,
  salaries,
  onChange,
  onReset,
}) => {
  return (
    <Space wrap>
      <Input
        placeholder="Tìm theo tiêu đề"
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        style={{ width: 200 }}
      />

      <Select
        placeholder="Chọn địa điểm"
        value={filters.location || undefined}
        onChange={(v) => onChange({ location: v || "" })}
        allowClear
        style={{ width: 160 }}
      >
        {locations.map((loc) => (
          <Select.Option key={loc} value={loc}>
            {loc}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="Chọn mức lương"
        value={filters.salary || undefined}
        onChange={(v) => onChange({ salary: v || "" })}
        allowClear
        style={{ width: 140 }}
      >
        {salaries.map((sal) => (
          <Select.Option key={sal} value={sal}>
            {sal}
          </Select.Option>
        ))}
      </Select>

      <Button icon={<ReloadOutlined />} onClick={onReset} />
    </Space>
  );
};

export default RecruitmentFilter;
