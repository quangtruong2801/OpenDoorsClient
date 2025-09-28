import { Modal, Form, Input, Select, DatePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Option } = Select;

export type NewMember = {
  name: string;
  email: string;
  avatar: string;
  teamId: string;
  team: string;
  type: "fulltime" | "parttime";
  jobType: "dev" | "design";
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

  useEffect(() => {
    fetch("http://localhost:5000/api/teams")
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("❌ Lỗi tải danh sách team:", err));
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const teamObj = teams.find(t => t.id === values.teamId);
      const payload: NewMember = {
        ...values,
        team: teamObj?.teamName || "",
        startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
      };
      onSubmit(payload); // ✅ gửi data lên TeamMember
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
      onCancel={() => { form.resetFields(); onCancel(); }}
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

        <Form.Item name="teamId" label="Team" rules={[{ required: true }]}>
          <Select placeholder="Chọn team">
            {teams.map(t => (
              <Option key={t.id} value={t.id}>
                {t.teamName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="type" label="Hình thức" rules={[{ required: true }]}>
          <Select>
            <Option value="fulltime">Full Time</Option>
            <Option value="parttime">Part Time</Option>
          </Select>
        </Form.Item>

        <Form.Item name="jobType" label="Loại công việc" rules={[{ required: true }]}>
          <Select>
            <Option value="dev">Developer</Option>
            <Option value="design">Designer</Option>
          </Select>
        </Form.Item>

        <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
