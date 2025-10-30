import { Input, Select, Space } from "antd";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface TeamFilterProps {
  search: string;
  memberFilter: string;
  onSearchChange: (v: string) => void;
  onMemberFilterChange: (v: string) => void;
}

export default function TeamFilter({
  search,
  memberFilter,
  onSearchChange,
  onMemberFilterChange,
}: TeamFilterProps) {
  const { t } = useTranslation();

  return (
    <Space size="middle" className="flex flex-wrap w-full gap-4">
      <Input
        placeholder={t("teamFilter.searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 200 }}
        allowClear
      />
      <Select
        placeholder={t("teamFilter.memberPlaceholder")}
        value={memberFilter || undefined}
        onChange={onMemberFilterChange}
        style={{ width: 180 }}
        allowClear
      >
        {/* <Option value="all">{t("teamFilter.all")}</Option> */}
        <Option value="lt5">{t("teamFilter.lt5")}</Option>
        <Option value="5to10">{t("teamFilter.5to10")}</Option>
        <Option value="gt10">{t("teamFilter.gt10")}</Option>
      </Select>
    </Space>
  );
}
