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
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Lưu file tạm
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // Dùng để hiển thị preview

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
          password: "",
        });
        setAvatarUrl(initialValues.avatar);
        setAvatarFile(null); // Reset file tạm
      } else {
        form.resetFields();
        setAvatarUrl("");
        setAvatarFile(null);
      }
    }
  }, [open, initialValues, form, teams]);

  // Chọn file avatar (không upload ngay)
  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    return false; // Ngăn Upload tự gửi
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!values.socials || values.socials.length === 0) {
        message.error("Bạn phải nhập ít nhất 1 mạng xã hội!");
        return;
      }

      // Upload avatar nếu có file mới
      let avatarUploadUrl = avatarUrl;
      let avatarPublicId = form.getFieldValue("avatarPublicId");
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        try {
          const res = await axios.post("/upload/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          avatarUploadUrl = res.data.url;
          avatarPublicId = res.data.publicId;
          // message.success("Tải ảnh thành công!");
        } catch (err) {
          console.error(err);
          message.error("Tải ảnh thất bại!");
          return;
        }
      }

      const teamObj = teams.find((t) => t.id === values.teamId);

      const payload: NewMember = {
        ...values,
        ...(values.password && values.password.trim() !== ""
          ? { password: values.password }
          : {}),
        avatar: avatarUploadUrl,
        avatarPublicId,
        team: teamObj?.teamName || "",
        startDate: dayjs(values.startDate).format("DD-MM-YYYY"),
        birthday: dayjs(values.birthday).format("DD-MM-YYYY"),
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
      setAvatarFile(null);
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
        setAvatarFile(null);
        onCancel();
      }}
      destroyOnHidden
      okText="Lưu"
      cancelText="Hủy"
      width={900}
      // maskClosable={false}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
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
                <Upload
                  accept="image/*"
                  beforeUpload={handleAvatarSelect}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>
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
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="hobbies"
              label="Sở thích"
              rules={[{ required: true }]}
            >
              <Input.TextArea placeholder="Nhập sở thích" rows={2} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Mạng xã hội" required>
              <Form.List name="socials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8, // khoảng cách giữa các dòng
                        }}
                      >
                        {/* Nền tảng */}
                        <Form.Item
                          {...restField}
                          name={[name, "platform"]}
                          rules={[{ required: true }]}
                          style={{ flex: 2, marginBottom: 0 }}
                        >
                          <Select placeholder="Chọn nền tảng">
                            {SOCIAL_OPTIONS.map((s) => {
                              const Icon = s.icon;
                              return (
                                <Select.Option
                                  key={`${key}-${s.key}`}
                                  value={s.key}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Icon color={s.color} />
                                    {s.label}
                                  </div>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>

                        {/* Link */}
                        <Form.Item
                          {...restField}
                          name={[name, "url"]}
                          rules={[{ required: true, type: "url" }]}
                          style={{ flex: 3, marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập link" />
                        </Form.Item>

                        {/* Nút xóa */}
                        <DeleteOutlined
                          onClick={() => remove(name)}
                          style={{
                            color: "red",
                            cursor: "pointer",
                            fontSize: 20,
                          }}
                        />
                      </div>
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
              <Select mode="multiple" placeholder="Chọn công việc">
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
