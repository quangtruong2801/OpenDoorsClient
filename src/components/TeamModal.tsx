import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      title={
        isEdit
          ? t("teamModal.editTitle", { defaultValue: "Chỉnh sửa Team" })
          : t("teamModal.addTitle", { defaultValue: "Thêm Team mới" })
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText={
        isEdit
          ? t("teamModal.update", { defaultValue: "Cập nhật" })
          : t("teamModal.add", { defaultValue: "Thêm" })
      }
      cancelText={t("teamModal.cancel", { defaultValue: "Hủy" })}
      maskClosable={false}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={handleOk}>
        <Form.Item
          label={t("teamModal.nameLabel", { defaultValue: "Tên Team" })}
          name="teamName"
          rules={[
            {
              required: true,
              message: t("teamModal.requiredName", {
                defaultValue: "Vui lòng nhập tên team",
              }),
            },
          ]}
        >
          <Input
            placeholder={t("teamModal.namePlaceholder", {
              defaultValue: "Nhập tên team...",
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
