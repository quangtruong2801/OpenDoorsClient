import { Modal, Form, Input } from "antd";
import { useEffect } from "react";

export type AddTeamModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { teamName: string }) => void;
  initialValues?: { teamName: string } | null;
  isEdit?: boolean;
};

export default function AddTeamModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isEdit,
}: AddTeamModalProps) {
  const [form] = Form.useForm();

  // ✅ Set giá trị khi edit
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
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa Team" : "Thêm Team mới"}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText={isEdit ? "Cập nhật" : "Thêm"}
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
