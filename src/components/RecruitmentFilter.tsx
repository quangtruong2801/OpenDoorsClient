import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Drawer,
  Row,
  Col,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

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
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Space wrap>
        <Input
          placeholder={t("recruitmentFilter.searchPlaceholder")}
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />

        <Tooltip title={t("recruitmentFilter.advancedFilter")}>
          <Button
            type="default"
            icon={<FilterOutlined />}
            onClick={() => setOpen(true)}
          />
        </Tooltip>

        <Tooltip title={t("recruitmentFilter.resetFilter")}>
          <Button icon={<ReloadOutlined />} onClick={onReset} type="default" />
        </Tooltip>
      </Space>

      <Drawer
        title={t("recruitmentFilter.drawerTitle")}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 400}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          body: { paddingBottom: 80 },
        }}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setOpen(false)} style={{ marginRight: 8 }}>
              {t("recruitmentFilter.close")}
            </Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              {t("recruitmentFilter.apply")}
            </Button>
          </div>
        }
      >
        <Form layout="vertical">
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Form.Item label={t("recruitmentFilter.locationLabel")}>
                <Select
                  placeholder={t("recruitmentFilter.selectLocation")}
                  value={filters.location || undefined}
                  onChange={(v) => onChange({ location: v || "" })}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={locations.map((loc) => ({
                    label: loc,
                    value: loc,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label={t("recruitmentFilter.salaryLabel")}>
                <Select
                  placeholder={t("recruitmentFilter.selectSalary")}
                  value={filters.salary || undefined}
                  onChange={(v) => onChange({ salary: v || "" })}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={salaries.map((sal) => ({
                    label: sal,
                    value: sal,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default RecruitmentFilter;
