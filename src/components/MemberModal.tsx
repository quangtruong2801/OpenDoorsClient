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
  theme,
} from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "../api/config";
import type { NewMember, Social, Member } from "../types/Member";
import { SOCIAL_OPTIONS } from "../constants/socials";

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const { token } = theme.useToken();

  // 🔹 Lấy dữ liệu team + job
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, jobsRes] = await Promise.all([
          axios.get("/teams"),
          axios.get("/jobs"),
        ]);
        setTeams(teamsRes.data);
        setJobs(jobsRes.data);
      } catch {
        message.error("Không thể tải danh sách team hoặc công việc");
      }
    };
    fetchData();
  }, []);

  // 🔹 Khi mở modal
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
          socials:
            initialValues.socials?.length > 0
              ? initialValues.socials
              : [{ platform: "", url: "" }],
          teamId: teams.find((t) => t.teamName === initialValues.team)?.id,
          password: "",
          hobbies: initialValues.hobbies?.join("\n"),
        });
        setAvatarUrl(initialValues.avatar);
        setAvatarFile(null);
      } else {
        form.resetFields();
        setAvatarUrl("");
        setAvatarFile(null);
      }
    }
  }, [open, initialValues, form, teams]);

  // 🔹 Xử lý upload ảnh
  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  // 🔹 Submit
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!values.socials?.length) {
        message.error("Bạn phải nhập ít nhất 1 mạng xã hội!");
        return;
      }

      let avatarUploadUrl = avatarUrl;
      let avatarPublicId = form.getFieldValue("avatarPublicId");

      if (avatarFile) {
        const formData = new FormData();
        formData.append("File", avatarFile);

        try {
          const res = await axios.post("/upload/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          avatarUploadUrl = res.data.url;
          avatarPublicId = res.data.publicId;
        } catch {
          message.error("Tải ảnh thất bại!");
          return;
        }
      }

      const teamObj = teams.find((t) => t.id === values.teamId);

      const payload: NewMember = {
        ...values,
        ...(values.password?.trim() ? { password: values.password } : {}),
        avatar: avatarUploadUrl,
        avatarPublicId,
        team: teamObj?.teamName || "",
        startDate: dayjs(values.startDate).format("DD-MM-YYYY"),
        birthday: dayjs(values.birthday).format("DD-MM-YYYY"),
        jobType: Array.isArray(values.jobType)
          ? values.jobType
          : [values.jobType],
        hobbies: values.hobbies
          ? values.hobbies
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean)
          : [],
        socials: values.socials.map((s: Social) => ({
          platform: s.platform,
          url: s.url,
        })),
      };

      onSubmit(payload);
      form.resetFields();
      setAvatarUrl("");
      setAvatarFile(null);
    } catch {
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
      okText="Lưu"
      cancelText="Hủy"
      width={900}
      styles={{
        content: {
          backgroundColor: token.colorBgContainer,
          color: token.colorText,
        },
      }}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          {/* --- Cột trái --- */}
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
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
                  <Button
                    icon={<UploadOutlined />}
                    type="primary"
                    ghost={!!avatarUrl}
                  >
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
                      border: `1px solid ${token.colorBorder}`,
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
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="hobbies"
              label="Sở thích"
              rules={[{ required: true, message: "Vui lòng nhập ít nhất 1 sở thích" }]}
            >
              <Input.TextArea rows={4} placeholder="Nhập mỗi dòng 1 sở thích" />
            </Form.Item>
          </Col>

          {/* --- Cột phải --- */}
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
                          marginBottom: 8,
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "platform"]}
                          rules={[{ required: true }]}
                          style={{ flex: 2, marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Chọn nền tảng"
                            options={SOCIAL_OPTIONS.map((s) => ({
                              label: (
                                 <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                  <s.icon color={s.color} /> {s.label}
                                </span>
                              ),
                              value: s.key,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "url"]}
                          rules={[{ required: true, type: "url" }]}
                          style={{ flex: 3, marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập link" />
                        </Form.Item>

                        <DeleteOutlined
                          onClick={() => remove(name)}
                          style={{ color: token.colorError, cursor: "pointer" }}
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
              <Select
                placeholder="Chọn team"
                options={teams.map((t) => ({
                  label: t.teamName,
                  value: t.id,
                }))}
              />
            </Form.Item>

            <Form.Item name="type" label="Hình thức" rules={[{ required: true }]}>
              <Select
                placeholder="Chọn hình thức"
                options={[
                  { label: "Full Time", value: "fulltime" },
                  { label: "Part Time", value: "parttime" },
                  { label: "Intern", value: "intern" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="jobType"
              label="Công việc"
              rules={[{ required: true }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn công việc"
                options={jobs.map((job) => ({
                  label: job.jobName,
                  value: job.jobName,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true }]}
            >
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
