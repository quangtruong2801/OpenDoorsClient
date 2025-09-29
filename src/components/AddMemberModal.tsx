import { Modal, Form, Input, Select, DatePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { API_BASE_URL } from "../api/config";

const { Option } = Select;

export type NewMember = {
  name: string;
  email: string;
  avatar: string;
  birthday: string;
  hobbies: string;
  socials: string;
  teamId: string;
  team: string;
  type: "fulltime" | "parttime" | "intern";
  jobType: string;
  startDate: string;
};

type AddMemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: NewMember) => void;
};

export default function AddMemberModal({ open, onCancel, onSubmit }: AddMemberModalProps) {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<{ id: string; teamName: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; jobName: string }[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("❌ Lỗi tải danh sách team:", err));

    fetch(`${API_BASE_URL}/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("❌ Lỗi tải danh sách công việc:", err));
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const teamObj = teams.find((t) => t.id === values.teamId);

      const payload: NewMember = {
        ...values,
        team: teamObj?.teamName || "",
        startDate: dayjs(values.startDate).format("DD-MM-YYYY"),
        birthday: dayjs(values.birthday).format("DD-MM-YYYY"),
      };

      onSubmit(payload);
      form.resetFields();
    } catch {
      // validate fail
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
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
          <Input placeholder="Nhập họ tên" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item name="avatar" label="Avatar URL" rules={[{ required: true }]}>
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item name="birthday" label="Ngày sinh" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item name="hobbies" label="Sở thích" rules={[{ required: true }]}>
          <Input.TextArea placeholder="Nhập sở thích cá nhân" rows={2} />
        </Form.Item>

        <Form.Item name="socials" label="Mạng xã hội" rules={[{ required: true }]}>
          <Input placeholder="VD: https://linkedin.com/in/username" />
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
          <Select placeholder="Chọn công việc">
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
      </Form>
    </Modal>
  );
}
