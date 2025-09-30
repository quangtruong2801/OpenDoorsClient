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
  Upload,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
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

// Thông tin Cloudinary:
const CLOUD_NAME = "dns356lwm";
const UPLOAD_PRESET = "member_upload";

export default function AddMemberModal({
  open,
  onCancel,
  onSubmit,
}: AddMemberModalProps) {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<{ id: string; teamName: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; jobName: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

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

  // Upload ảnh lên Cloudinary
  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "member_upload");

    setUploading(true);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      const url = res.data.secure_url;
      setAvatarUrl(url);
      form.setFieldsValue({ avatar: url }); // Gán vào form để submit
      message.success("Tải ảnh thành công!");
    } catch (error) {
      console.error(error);
      message.error("Tải ảnh thất bại!");
    } finally {
      setUploading(false);
    }
    return false; //Ngăn Upload tự gửi request mặc định
  };

  // Submit form
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
        avatar: avatarUrl, //dùng URL sau khi upload
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
      setAvatarUrl("");
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
        setAvatarUrl("");
        onCancel();
      }}
      destroyOnClose
      okText="Lưu"
      cancelText="Hủy"
      width={900}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          {/* Cột 1 */}
          <Col span={12}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            {/* Upload Avatar */}
            <Form.Item
              name="avatar"
              label="Ảnh đại diện"
              rules={[{ required: true, message: "Vui lòng tải ảnh đại diện" }]}
            >
              <Upload
                accept="image/*"
                beforeUpload={handleAvatarUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {avatarUrl ? "Thay ảnh" : "Chọn ảnh từ máy"}
                </Button>
              </Upload>

              {avatarUrl && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={avatarUrl}
                    alt="avatar preview"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Ngày sinh"
              rules={[{ required: true, message: "Chọn ngày sinh" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="hobbies"
              label="Sở thích"
              rules={[{ required: true, message: "Vui lòng nhập sở thích" }]}
            >
              <Input.TextArea placeholder="Nhập sở thích cá nhân" rows={2} />
            </Form.Item>
          </Col>

          {/* Cột 2 */}
          <Col span={12}>
            {/* Mạng xã hội */}
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
