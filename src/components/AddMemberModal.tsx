import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Button,
  Row,
  Col,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { API_BASE_URL } from "../api/config";
import type { NewMember, Social } from "../types/Member";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const { Option } = Select;

type AddMemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: NewMember) => void;
};

export default function AddMemberModal({
  open,
  onCancel,
  onSubmit,
}: AddMemberModalProps) {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<{ id: string; teamName: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; jobName: string }[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/teams`)
      .then((res) => res.json())
      .then(setTeams)
      .catch(console.error);
    fetch(`${API_BASE_URL}/jobs`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(console.error);
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.socials || values.socials.length === 0) {
        message.error("Bạn phải nhập ít nhất 1 mạng xã hội!");
        return;
      }

      const teamObj = teams.find((t) => t.id === values.teamId);

      const payload: NewMember = {
        ...values,
        team: teamObj?.teamName || "",
        startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
        birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
        jobType: Array.isArray(values.jobType)
          ? values.jobType
          : [values.jobType],
        socials: values.socials.map((s: Social) => ({
          platform: s.platform,
          url: s.url,
        })),
      };

      onSubmit(payload);
      form.resetFields();
    } catch (err) {
      console.error("Validate error:", err);
    }
  };

  return (
    <Modal
      title="Thêm thành viên mới"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnClose
      okText="Lưu"
      cancelText="Hủy"
      width={900} // rộng hơn để đủ 2 cột
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          {/* Cột 1 */}
          <Col span={12}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="avatar"
              label="Avatar URL"
              rules={[{ required: true }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Ngày sinh"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="hobbies"
              label="Sở thích"
              rules={[{ required: true }]}
            >
              <Input.TextArea placeholder="Nhập sở thích cá nhân" rows={2} />
            </Form.Item>
          </Col>

          {/* Cột 2 */}
          <Col span={12}>
            {/* Socials */}
            <Form.Item label="Mạng xã hội" required>
              <Form.List name="socials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        align="baseline"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "platform"]}
                          rules={[{ required: true, message: "Chọn nền tảng" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Chọn nền tảng"
                            style={{ width: 150 }}
                          >
                            <Option value="LinkedIn">
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <FaLinkedin color="#0077B5" />
                                LinkedIn
                              </span>
                            </Option>
                            <Option value="Facebook">
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <FaFacebook color="#1877F2" />
                                Facebook
                              </span>
                            </Option>
                            <Option value="Twitter">
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <FaTwitter color="#1DA1F2" />
                                Twitter
                              </span>
                            </Option>
                            <Option value="Instagram">
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <FaInstagram color="#C13584" />
                                Instagram
                              </span>
                            </Option>
                            <Option value="TikTok">
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <FaTiktok color="#000000" />
                                TikTok
                              </span>
                            </Option>
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "url"]}
                          rules={[
                            {
                              required: true,
                              type: "url",
                              message: "Nhập link hợp lệ",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder="Nhập link"
                            style={{ width: 250 }}
                          />
                        </Form.Item>

                        <DeleteOutlined
                          style={{
                            color: "red",
                            fontSize: 18,
                            cursor: "pointer",
                          }}
                          onClick={() => remove(name)}
                        />
                      </Space>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm mạng xã hội
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item name="teamId" label="Team" rules={[{ required: true }]}>
              <Select placeholder="Chọn team">
                {teams.map((t) => (
                  <Option key={t.id} value={t.id}>
                    {t.teamName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="type"
              label="Hình thức"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn hình thức">
                <Option value="fulltime">Full Time</Option>
                <Option value="parttime">Part Time</Option>
                <Option value="intern">Intern</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="jobType"
              label="Công việc"
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn công việc"
                optionFilterProp="children"
                allowClear
              >
                {jobs.map((job) => (
                  <Option key={job.id} value={job.jobName}>
                    {job.jobName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
