import { Input, Select, Space, Button } from "antd";

const { Option } = Select;

type Props = {
  data: {
    companyName: string;
    salary: string;
    title: string;
  }[];
  search?: string;
  company?: string;
  salary?: string;
  onSearchChange?: (value: string) => void;
  onCompanyChange?: (value: string) => void;
  onSalaryChange?: (value: string) => void;
};

export default function RecruitmentFilter({
  data,
  search = "",
  company = "",
  salary = "",
  onSearchChange,
  onCompanyChange,
  onSalaryChange,
}: Props) {
  // Tạo danh sách company và salary có sẵn từ data
  const companyList = Array.from(new Set(data.map((d) => d.companyName))).filter(Boolean);
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
        placeholder="Chọn công ty"
        value={company || undefined}
        onChange={(value) => onCompanyChange?.(value || "")}
        allowClear
        style={{ width: 160 }}
      >
        {companyList.map((c) => (
          <Option key={c} value={c}>
            {c}
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
          onCompanyChange?.("");
          onSalaryChange?.("");
        }}
      >
        Reset
      </Button>
    </Space>
  );
}
