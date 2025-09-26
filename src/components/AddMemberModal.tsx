import { Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";

const { Option } = Select;

type AddMemberModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: string) => void;
};

type Team = {
  id: string;
  teamName: string;
};

export default function AddMemberModal({
  open,
  onCancel,
  onSubmit,
}: AddMemberModalProps) {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<Team[]>([]);

  // 📦 Lấy danh sách team từ TeamManagement (mock)
  useEffect(() => {
    const mockTeams: Team[] = Array.from({ length: 10 }, (_, i) => ({
      id: (i + 1).toString(),
      teamName: `Team ${i + 1}`,
    }));
    setTeams(mockTeams);
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      // bỏ qua lỗi validate
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Thêm thành viên mới"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="teamId"
          label="Team"
          rules={[{ required: true, message: "Vui lòng chọn team" }]}
        >
          <Select placeholder="Chọn team">
            {teams.map((team) => (
              <Option key={team.id} value={team.id}>
                {team.teamName}
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
            <Option value="fulltime">Full Time</Option>
            <Option value="parttime">Part Time</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="jobType"
          label="Loại công việc"
          rules={[{ required: true, message: "Vui lòng chọn công việc" }]}
        >
          <Select placeholder="Chọn loại công việc">
            <Option value="dev">Developer</Option>
            <Option value="design">Designer</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
