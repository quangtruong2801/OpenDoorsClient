
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
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "../api/config";
import type { NewMember, Social, Member } from "../types/Member";
import { SOCIAL_OPTIONS } from "../constants/socials";

const { Option } = Select;

type AddMemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: NewMember) => void;
  initialValues?: Member;
  isEdit?: boolean;
};

export default function AddMemberModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isEdit = false,
}: AddMemberModalProps) {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<{ id: string; teamName: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; jobName: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Fetch teams & jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, jobsRes] = await Promise.all([
          axios.get("/teams"),
          axios.get("/jobs"),
        ]);
        setTeams(teamsRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách team hoặc công việc");
      }
    };
    fetchData();
  }, []);

  // Set form values khi mở modal
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          startDate: initialValues.startDate
            ? dayjs(initialValues.startDate, "DD-MM-YYYY")
            : null,
          birthday: initialValues.birthday
            ? dayjs(initialValues.birthday, "DD-MM-YYYY")
            : null,
          jobType: initialValues.jobType,
          socials: initialValues.socials?.length
            ? initialValues.socials
            : [{ platform: "", url: "" }],
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
      const res = await axios.post("/upload/upload", formData, {
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
      message.error("Điền đầy đủ thông tin hợp lệ!");
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
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="password"
              label={isEdit ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"}
              rules={[{ required: !isEdit, message: "Nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              name="avatar"
              label="Ảnh đại diện"
              rules={[{ required: true, message: "Vui lòng tải ảnh đại diện" }]}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Upload accept="image/*" beforeUpload={handleAvatarUpload} showUploadList={false}>
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

            <Form.Item name="birthday" label="Ngày sinh" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item name="hobbies" label="Sở thích" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Nhập sở thích" rows={2} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Mạng xã hội" required>
              <Form.List name="socials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={`row-${key}`} gutter={[8, 8]} align="middle">
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "platform"]}
                            rules={[{ required: true }]}
                          >
                            <Select placeholder="Chọn nền tảng">
                              {SOCIAL_OPTIONS.map((s) => {
                                const Icon = s.icon;
                                return (
                                  <Option key={`social-${key}-${s.key}`} value={s.key}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                      <Icon color={s.color} />
                                      {s.label}
                                    </div>
                                  </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={14}>
                          <Form.Item
                            {...restField}
                            name={[name, "url"]}
                            rules={[{ required: true, type: "url" }]}
                          >
                            <Input placeholder="Nhập link" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={2} style={{ textAlign: "center" }}>
                          <DeleteOutlined
                            onClick={() => remove(name)}
                            style={{ color: "red", cursor: "pointer" }}
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

            <Form.Item name="teamId" label="Team" rules={[{ required: true }]}>
              <Select placeholder="Chọn team">
                {teams.map((t) => (
                  <Option key={t.id} value={t.id}>
                    {t.teamName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="type" label="Hình thức" rules={[{ required: true }]}>
              <Select placeholder="Chọn hình thức">
                <Option value="fulltime">Full Time</Option>
                <Option value="parttime">Part Time</Option>
                <Option value="intern">Intern</Option>
              </Select>
            </Form.Item>

            <Form.Item name="jobType" label="Công việc" rules={[{ required: true }]}>
              <Select mode="multiple" placeholder="Chọn công việc">
                {jobs.map((job) => (
                  <Option key={job.id} value={job.jobName}>
                    {job.jobName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
