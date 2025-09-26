import { Modal, Form, Input } from "antd";

export type AddTeamModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { teamName: string }) => void;
};

export default function AddTeamModal({ open, onCancel, onSubmit }: AddTeamModalProps) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Modal
      title="Thêm Team mới"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Thêm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên Team"
          name="teamName"
          rules={[{ required: true, message: "Vui lòng nhập tên team" }]}
        >
          <Input placeholder="Nhập tên team..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
