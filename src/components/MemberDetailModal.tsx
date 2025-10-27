import { Modal, Descriptions, Tag } from "antd";
import type { Member } from "~/types/Member";

interface MemberDetailModalProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
}

export default function MemberDetailModal({ open, member, onClose }: MemberDetailModalProps) {
  if (!member) return null;

  const renderTags = (items?: string[]) =>
    items?.length ? items.map((item) => <Tag color="blue" key={item}>{item}</Tag>) : "—";

  const renderList = (items?: string[]) =>
    items?.length ? (
      <ul style={{ listStyleType: "disc", paddingLeft: 20, margin: 0 }}>
        {items.map((item, idx) => <li key={idx}>{item}</li>)}
      </ul>
    ) : "—";

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={member.name}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Avatar">
          <img
            src={member.avatar}
            alt={member.name}
            style={{ width: 100, height: 100, borderRadius: "50%" }}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Email">{member.email || "—"}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{member.birthday || "—"}</Descriptions.Item>
        <Descriptions.Item label="Team">{member.team || "Không thuộc team nào"}</Descriptions.Item>
        <Descriptions.Item label="Công việc">{renderTags(member.jobType)}</Descriptions.Item>
        <Descriptions.Item label="Sở thích">{renderList(member.hobbies)}</Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">{member.startDate || "—"}</Descriptions.Item>
        <Descriptions.Item label="Hình thức">{member.type || "—"}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
