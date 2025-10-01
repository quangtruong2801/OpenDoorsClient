import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
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
import type { NewMember, Social, Member } from "../types/Member";
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
  initialValues?: Member; // Dữ liệu khi edit
  isEdit?: boolean;
};

export default function AddMemberModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isEdit,
}: AddMemberModalProps) {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<{ id: string; teamName: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; jobName: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Fetch teams & jobs
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

  // Set giá trị form khi modal mở (thêm hoặc edit)
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          startDate: initialValues.startDate ? dayjs(initialValues.startDate, "DD-MM-YYYY") : null,
          birthday: initialValues.birthday ? dayjs(initialValues.birthday, "DD-MM-YYYY") : null,
          jobType: initialValues.jobType,
          socials: initialValues.socials,
          teamId: teams.find((t) => t.teamName === initialValues.team)?.id,
          avatar: initialValues.avatar,
          avatarPublicId: initialValues.avatarPublicId,
        });
        setAvatarUrl(initialValues.avatar);
      } else {
        form.resetFields();
        setAvatarUrl("");
      }
    }
  }, [open, initialValues, form, teams]);

  // Upload avatar
  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/Upload/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { url, publicId } = res.data;
      setAvatarUrl(url);
      form.setFieldsValue({ avatar: url, avatarPublicId: publicId });

      message.success("Tải ảnh thành công!");
    } catch (error) {
      console.error(error);
      message.error("Tải ảnh thất bại!");
    } finally {
      setUploading(false);
    }

    return false;
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
        avatar: avatarUrl,
        avatarPublicId: form.getFieldValue("avatarPublicId"),
        team: teamObj?.teamName || "",
        startDate: dayjs(values.startDate).format("DD-MM-YYYY"),
        birthday: dayjs(values.birthday).format("DD-MM-YYYY"),
        jobType: Array.isArray(values.jobType) ? values.jobType : [values.jobType],
        socials: values.socials.map((s: Social) => ({ platform: s.platform, url: s.url })),
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
      title={isEdit ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setAvatarUrl("");
        onCancel();
      }}
      destroyOnHidden
      okText="Lưu"
      cancelText="Hủy"
      width={900}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          {/* Cột 1 */}
          <Col xs={24} sm={12}>
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
                { required: true, type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="avatar"
              label="Ảnh đại diện"
              rules={[{ required: true, message: "Vui lòng tải ảnh đại diện" }]}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                )}
              </div>
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
          <Col xs={24} sm={12}>
            <Form.Item label="Mạng xã hội" required>
              <Form.List name="socials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={`social-${key}`} gutter={[8, 8]} align="middle">
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "platform"]}
                            rules={[{ required: true, message: "Chọn nền tảng" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select placeholder="Chọn nền tảng" style={{ width: "100%" }}>
                              <Option value="LinkedIn">
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FaLinkedin color="#0077B5" /> LinkedIn
                                </span>
                              </Option>
                              <Option value="Facebook">
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FaFacebook color="#1877F2" /> Facebook
                                </span>
                              </Option>
                              <Option value="Twitter">
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FaTwitter color="#1DA1F2" /> Twitter
                                </span>
                              </Option>
                              <Option value="Instagram">
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FaInstagram color="#C13584" /> Instagram
                                </span>
                              </Option>
                              <Option value="TikTok">
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <FaTiktok color="#000000" /> TikTok
                                </span>
                              </Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={14}>
                          <Form.Item
                            {...restField}
                            name={[name, "url"]}
                            rules={[{ required: true, type: "url", message: "Nhập link hợp lệ" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Nhập link" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={2} style={{ textAlign: "center" }}>
                          <DeleteOutlined
                            style={{ color: "red", fontSize: 18, cursor: "pointer" }}
                            onClick={() => remove(name)}
                          />
                        </Col>
                      </Row>
                    ))}

                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm mạng xã hội
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item
              name="teamId"
              label="Team"
              rules={[{ required: true, message: "Vui lòng chọn team" }]}
            >
              <Select placeholder="Chọn team">
                {teams.map((t) => (
                  <Option key={`team-${t.id}`} value={t.id}>
                    {t.teamName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="type"
              label="Hình thức"
              rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
            >
              <Select placeholder="Chọn hình thức">
                <Option key="fulltime" value="fulltime">Full Time</Option>
                <Option key="parttime" value="parttime">Part Time</Option>
                <Option key="intern" value="intern">Intern</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="jobType"
              label="Công việc"
              rules={[{ required: true, message: "Vui lòng chọn công việc" }]}
            >
              <Select mode="multiple" placeholder="Chọn công việc" allowClear optionFilterProp="children">
                {jobs.map((job, index) => (
                  <Option key={job.id ?? `job-${index}`} value={job.jobName}>
                    {job.jobName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
