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
  // theme,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { FC } from "react";

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
  // const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* === Tìm kiếm nhanh và nút lọc / đặt lại === */}
      <Space wrap>
        <Input
          placeholder="Tìm theo tiêu đề"
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />

        <Tooltip title="Bộ lọc nâng cao">
          <Button
            type="default"
            icon={<FilterOutlined />}
            onClick={() => setOpen(true)}
          ></Button>
        </Tooltip>

        <Tooltip title="Đặt lại bộ lọc">
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            type="default"
            // style={{ color: token.colorPrimary }}
          />
        </Tooltip>
      </Space>

      {/* === Drawer bộ lọc nâng cao === */}
      <Drawer
        title="Bộ lọc nâng cao"
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
              Đóng
            </Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              Áp dụng
            </Button>
          </div>
        }
      >
        <Form layout="vertical">
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Form.Item label="Địa điểm">
                <Select
                  placeholder="Chọn địa điểm"
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
              <Form.Item label="Mức lương">
                <Select
                  placeholder="Chọn mức lương"
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
