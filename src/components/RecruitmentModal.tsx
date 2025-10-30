import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Row, Col } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { Recruitment } from "../types/Recruitment";

type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: Omit<Recruitment, "id">) => void;
  initialValues?: Recruitment;
  isEdit?: boolean;
};

export default function AddRecruitmentModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isEdit,
}: Props) {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  // Khi mở modal: set lại giá trị ban đầu
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          deadline: initialValues.deadline
            ? dayjs(initialValues.deadline)
            : null,
          description: initialValues.description?.join("\n"),
          requirements: initialValues.requirements?.join("\n"),
          benefits: initialValues.benefits?.join("\n"),
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  // Xử lý khi nhấn OK
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload: Omit<Recruitment, "id"> = {
        ...values,
        deadline: values.deadline ? values.deadline.toDate() : null,
        description: values.description
          ? values.description
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean)
          : [],
        requirements: values.requirements
          ? values.requirements
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean)
          : [],
        benefits: values.benefits
          ? values.benefits
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean)
          : [],
      };

      onSubmit(payload);
      form.resetFields();
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Modal
      title={
        isEdit
          ? t("recruitmentModal.editTitle", { defaultValue: "Chỉnh sửa tin tuyển dụng" })
          : t("recruitmentModal.add", { defaultValue: "Thêm tin tuyển dụng" })
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText={
        isEdit
          ? t("recruitmentModal.update", { defaultValue: "Cập nhật" })
          : t("recruitmentModal.addNew", { defaultValue: "Thêm mới" })
      }
      width={800}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          companyName:
            "Công ty cổ phần Công Nghệ và Truyền Thông Việt Nam (VNTT)",
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="title"
              label={t("recruitmentModal.position", { defaultValue: "Tiêu đề" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredTitle", { defaultValue: "Vui lòng nhập tiêu đề" }) }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="companyName"
              label={t("recruitmentModal.company", { defaultValue: "Công ty" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredCompany", { defaultValue: "Vui lòng nhập tên công ty" }) }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="salary"
              label={t("recruitmentModal.salary", { defaultValue: "Mức lương" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredSalary", { defaultValue: "Vui lòng nhập mức lương" }) }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="location"
              label={t("recruitmentModal.location", { defaultValue: "Địa điểm" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredLocation", { defaultValue: "Vui lòng nhập địa điểm" }) }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="experience"
              label={t("recruitmentModal.experience", { defaultValue: "Kinh nghiệm (năm)" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredExperience", { defaultValue: "Vui lòng nhập kinh nghiệm" }) }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="deadline"
              label={t("recruitmentModal.deadline", { defaultValue: "Hạn nộp hồ sơ" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredDeadline", { defaultValue: "Vui lòng chọn hạn nộp" }) }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="description"
              label={t("recruitmentModal.description", { defaultValue: "Mô tả công việc" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredDescription", { defaultValue: "Vui lòng nhập mô tả công việc" }) }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="requirements"
              label={t("recruitmentModal.requirements", { defaultValue: "Yêu cầu ứng viên" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredRequirements", { defaultValue: "Vui lòng nhập yêu cầu" }) }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="benefits"
              label={t("recruitmentModal.benefits", { defaultValue: "Quyền lợi" })}
              rules={[{ required: true, message: t("recruitmentModal.requiredBenefits", { defaultValue: "Vui lòng nhập quyền lợi" }) }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
