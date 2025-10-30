import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      // validation failed
    }
  };

  return (
    <Modal
      title={
        initialValues
          ? t("addJobModal.editTitle")
          : t("addJobModal.addTitle")
      }
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnHidden
      okText={t("addJobModal.save")}
      cancelText={t("addJobModal.cancel")}
      maskClosable={false}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="jobName"
          label={t("addJobModal.jobName")}
          rules={[
            { required: true, message: t("addJobModal.jobNameRequired") },
          ]}
        >
          <Input placeholder={t("addJobModal.jobNamePlaceholder")} />
        </Form.Item>

        <Form.Item
          name="skills"
          label={t("addJobModal.skills")}
          rules={[
            { required: true, message: t("addJobModal.skillsRequired") },
          ]}
        >
          <Input placeholder={t("addJobModal.skillsPlaceholder")} />
        </Form.Item>

        <Form.Item
          name="requirement"
          label={t("addJobModal.requirement")}
          rules={[
            { required: true, message: t("addJobModal.requirementRequired") },
          ]}
        >
          <Input.TextArea
            placeholder={t("addJobModal.requirementPlaceholder")}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("addJobModal.description")}
          rules={[
            { required: true, message: t("addJobModal.descriptionRequired") },
          ]}
        >
          <Input.TextArea
            placeholder={t("addJobModal.descriptionPlaceholder")}
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
