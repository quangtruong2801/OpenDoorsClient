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
  // const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* === Tìm kiếm nhanh và nút lọc / đặt lại === */}
      <Space wrap>
        <Input
          placeholder="Nhập tên thành viên"
          prefix={<SearchOutlined />}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          allowClear
          style={{ width: 200 }}
        />

        <Tooltip title="Lọc nâng cao">
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

      {/* === Drawer chỉ chứa bộ lọc nâng cao === */}
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
              <Form.Item label="Hình thức làm việc">
                <Select
                  placeholder="Chọn hình thức"
                  value={filters.type || undefined}
                  onChange={(v) => onChange({ type: v || "" })}
                  allowClear
                  options={[
                    { label: "Full Time", value: "fulltime" },
                    { label: "Part Time", value: "parttime" },
                    { label: "Intern", value: "intern" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Công việc">
                <Select
                  placeholder="Chọn công việc"
                  value={filters.jobType || undefined}
                  onChange={(v) => onChange({ jobType: v || "" })}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={jobList.map((j) => ({
                    label: j.jobName,
                    value: j.jobName,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Team">
                <Select
                  placeholder="Chọn team"
                  value={filters.teamId || undefined}
                  onChange={(v) => onChange({ teamId: v || "" })}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={teamList.map((t) => ({
                    label: t.teamName,
                    value: t.id,
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

export default MemberFilter;
