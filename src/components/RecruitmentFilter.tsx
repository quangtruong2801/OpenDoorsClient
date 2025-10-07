import { Input, Select, Space, Button } from "antd";

const { Option } = Select;

type Props = {
  search?: string;
  location?: string;    
  salary?: string;
  locationList: string[];
  salaryList: string[];
  onSearchChange?: (value: string) => void;
  onLocationChange?: (value: string) => void;
  onSalaryChange?: (value: string) => void;
  onReset?: () => void;
};

export default function RecruitmentFilter({
  search = "",
  location = "",
  salary = "",
  locationList,
  salaryList,
  onSearchChange,
  onLocationChange,
  onSalaryChange,
  onReset,
}: Props) {

  return (
    <Space wrap>
      <Input
        placeholder="Tìm theo tiêu đề"
        value={search}
        onChange={(e) => onSearchChange?.(e.target.value)}
        style={{ width: 200 }}
      />

      <Select
        placeholder="Chọn địa điểm" 
        value={location || undefined}
        onChange={(value) => onLocationChange?.(value || "")}
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
        value={salary || undefined}
        onChange={(value) => onSalaryChange?.(value || "")}
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
