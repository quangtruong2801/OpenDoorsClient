import { Modal, Form, Input } from "antd";
import { useEffect } from "react";

type AddJobModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown> | null;
};

export default function AddJobModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
}: AddJobModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      // validate fail
    }
  };

  return (
    <Modal
      title={initialValues ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnHidden
      okText="Lưu"
      cancelText="Hủy"
      maskClosable={false}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="jobName"
          label="Tên công việc"
          rules={[{ required: true, message: "Vui lòng nhập tên công việc" }]}
        >
          <Input placeholder="Nhập tên công việc" />
        </Form.Item>

        <Form.Item
          name="skills"
          label="Kỹ năng"
          rules={[{ required: true, message: "Vui lòng nhập kỹ năng" }]}
        >
          <Input placeholder="VD: React, Node.js" />
        </Form.Item>

        <Form.Item
          name="requirement"
          label="Yêu cầu"
          rules={[{ required: true, message: "Vui lòng nhập yêu cầu" }]}
        >
          <Input.TextArea placeholder="Nhập yêu cầu công việc" rows={3} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea placeholder="Mô tả chi tiết công việc" rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
