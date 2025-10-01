import { Modal, Form, Input } from "antd";

type AddJobModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void; 
};

export default function AddJobModal({ open, onCancel, onSubmit }: AddJobModalProps) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values as Record<string, unknown>); 
      form.resetFields();
    } catch {
      // validate fail
    }
  };

  return (
    <Modal
      title="Thêm công việc mới"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnHidden
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="jobName" label="Tên công việc" rules={[{ required: true }]}>
          <Input placeholder="Nhập tên công việc" />
        </Form.Item>

        <Form.Item name="skills" label="Kỹ năng" rules={[{ required: true }]}>
          <Input placeholder="VD: React, Node.js" />
        </Form.Item>

        <Form.Item name="requirement" label="Yêu cầu" rules={[{ required: true }]}>
          <Input.TextArea placeholder="Nhập yêu cầu công việc" rows={3} />
        </Form.Item>

        <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
          <Input.TextArea placeholder="Mô tả chi tiết công việc" rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
