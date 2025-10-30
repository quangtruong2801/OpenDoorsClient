import { Modal, Descriptions, Tag } from "antd";
import type { Member } from "~/types/Member";
import { useTranslation } from "react-i18next";

interface MemberDetailModalProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
}

export default function MemberDetailModal({
  open,
  member,
  onClose,
}: MemberDetailModalProps) {
  const { t } = useTranslation();

  if (!member) return null;

  const renderTags = (items?: string[]) =>
    items?.length ? items.map((item) => <Tag color="blue" key={item}>{item}</Tag>) : "—";

  const renderList = (items?: string[]) =>
    items?.length ? (
      <ul style={{ listStyleType: "disc", paddingLeft: 20, margin: 0 }}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    ) : (
      "—"
    );

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={member.name}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label={t("memberDetail.avatar")}>
          <img
            src={member.avatar}
            alt={member.name}
            style={{ width: 100, height: 100, borderRadius: "50%" }}
          />
        </Descriptions.Item>

        <Descriptions.Item label={t("memberDetail.email")}>
          {member.email || "—"}
        </Descriptions.Item>
        <Descriptions.Item label={t("memberDetail.birthday")}>
          {member.birthday || "—"}
        </Descriptions.Item>
        <Descriptions.Item label={t("memberDetail.team")}>
          {member.team || t("memberDetail.noTeam")}
        </Descriptions.Item>
        <Descriptions.Item label={t("memberDetail.jobs")}>
          {renderTags(member.jobType)}
        </Descriptions.Item>
        <Descriptions.Item label={t("memberDetail.hobbies")}>
          {renderList(member.hobbies)}
        </Descriptions.Item>
        <Descriptions.Item label={t("memberDetail.startDate")}>
          {member.startDate || "—"}
        </Descriptions.Item>
        <Descriptions.Item label={t("memberDetail.type")}>
          {member.type || "—"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
