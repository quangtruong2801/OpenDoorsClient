import { Input, Select, Space, Button } from "antd";

const { Option } = Select;

type Props = {
  data: {
    location: string;
    salary: string;
    title: string;
  }[];
  search?: string;
  location?: string;    
  salary?: string;
  onSearchChange?: (value: string) => void;
  onLocationChange?: (value: string) => void;
  onSalaryChange?: (value: string) => void;
};

export default function RecruitmentFilter({
  data,
  search = "",
  location = "",
  salary = "",
  onSearchChange,
  onLocationChange,
  onSalaryChange,
}: Props) {
  //tạo danh sách
  const locationList = Array.from(new Set(data.map((d) => d.location))).filter(Boolean);
  const salaryList = Array.from(new Set(data.map((d) => d.salary))).filter(Boolean);

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

      <Button
        onClick={() => {
          onSearchChange?.("");
          onLocationChange?.(""); 
          onSalaryChange?.("");
        }}
      >
        Reset
      </Button>
    </Space>
  );
}
