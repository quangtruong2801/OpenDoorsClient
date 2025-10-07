import { Input, Select, Space, Button } from "antd";

const { Option } = Select;

type Props = {
  filters: {
    search: string;
    location: string;
    salary: string;
  };
  locationList: string[];
  salaryList: string[];
  onFiltersChange: (changed: Partial<Props["filters"]>) => void;
  onReset?: () => void;
};

export default function RecruitmentFilter({
  filters,
  locationList,
  salaryList,
  onFiltersChange,
  onReset,
}: Props) {
  return (
    <Space wrap>
      <Input
        placeholder="Tìm theo tiêu đề"
        value={filters.search}
        onChange={(e) => onFiltersChange({ search: e.target.value })}
        style={{ width: 200 }}
      />

      <Select
        placeholder="Chọn địa điểm"
        value={filters.location || undefined}
        onChange={(value) => onFiltersChange({ location: value || "" })}
        allowClear
        style={{ width: 160 }}
      >
        {locationList.map((l) => (
          <Option key={l} value={l}>
            {l}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Chọn mức lương"
        value={filters.salary || undefined}
        onChange={(value) => onFiltersChange({ salary: value || "" })}
        allowClear
        style={{ width: 140 }}
      >
        {salaryList.map((s) => (
          <Option key={s} value={s}>
            {s}
          </Option>
        ))}
      </Select>

      <Button onClick={onReset}>Reset</Button>
    </Space>
  );
}
