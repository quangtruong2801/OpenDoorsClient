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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  // Fetch team & job data
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
        message.error(t("addMember.loadFail"));
      }
    };
    fetchData();
  }, [t]);

  // Set form when open
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

  // Handle avatar
  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  // Submit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!values.socials?.length) {
        message.error(t("addMember.requireSocial"));
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
          message.error(t("addMember.uploadFail"));
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
      message.error(t("addMember.invalidForm"));
    }
  };

  return (
    <Modal
      title={isEdit ? t("addMember.editTitle") : t("addMember.addTitle")}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setAvatarUrl("");
        setAvatarFile(null);
        onCancel();
      }}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
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
          <Col xs={24} sm={12}>
            <Form.Item name="name" label={t("addMember.name")} rules={[{ required: true }]}>
              <Input placeholder={t("addMember.namePlaceholder")} />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label={isEdit ? t("addMember.passwordEdit") : t("addMember.password")}
              rules={[{ required: !isEdit, message: t("addMember.passwordRequired") }]}
            >
              <Input.Password placeholder={t("addMember.passwordPlaceholder")} />
            </Form.Item>

            <Form.Item
              name="avatar"
              label={t("addMember.avatar")}
              rules={[{ required: true, message: t("addMember.avatarRequired") }]}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Upload accept="image/*" beforeUpload={handleAvatarSelect} showUploadList={false}>
                  <Button icon={<UploadOutlined />} type="primary" ghost={!!avatarUrl}>
                    {avatarUrl ? t("addMember.changeAvatar") : t("addMember.selectAvatar")}
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

            <Form.Item name="birthday" label={t("addMember.birthday")} rules={[{ required: true }]}>
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="hobbies"
              label={t("addMember.hobbies")}
              rules={[{ required: true, message: t("addMember.hobbiesRequired") }]}
            >
              <Input.TextArea rows={4} placeholder={t("addMember.hobbiesPlaceholder")} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label={t("addMember.socials")} required>
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
                            placeholder={t("addMember.selectPlatform")}
                            options={SOCIAL_OPTIONS.map((s) => ({
                              label: (
                                <span
                                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                >
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
                          <Input placeholder={t("addMember.linkPlaceholder")} />
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
                        {t("addMember.addSocial")}
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item name="teamId" label="Team" rules={[{ required: true }]}>
              <Select
                placeholder={t("addMember.selectTeam")}
                options={teams.map((t) => ({
                  label: t.teamName,
                  value: t.id,
                }))}
              />
            </Form.Item>

            <Form.Item name="type" label={t("addMember.type")} rules={[{ required: true }]}>
              <Select
                placeholder={t("addMember.selectType")}
                options={[
                  { label: "Full Time", value: "fulltime" },
                  { label: "Part Time", value: "parttime" },
                  { label: "Intern", value: "intern" },
                ]}
              />
            </Form.Item>

            <Form.Item name="jobType" label={t("addMember.jobs")} rules={[{ required: true }]}>
              <Select
                mode="multiple"
                placeholder={t("addMember.selectJob")}
                options={jobs.map((job) => ({
                  label: job.jobName,
                  value: job.jobName,
                }))}
              />
            </Form.Item>

            <Form.Item name="startDate" label={t("addMember.startDate")} rules={[{ required: true }]}>
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
