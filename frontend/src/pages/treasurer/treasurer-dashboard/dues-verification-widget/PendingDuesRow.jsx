import { Col, Row } from "react-bootstrap";

export default function PendingDuesRow({ member, isPreview, onSelect }) {
  return (
    <Row
      className={`align-items-center gx-2 py-1${
        isPreview ? "" : " dues-review-row"
      }`}
      role={isPreview ? undefined : "button"}
      onClick={isPreview ? undefined : () => onSelect(member)}
    >
      <Col xs={2} className="inner-card-context small text-muted text-truncate">
        {member.firstName} {member.lastName}
      </Col>
      <Col xs={7} className="inner-card-context small text-muted text-truncate">
        {member.email}
      </Col>
      <Col xs={3} className="text-end">
        <span className={`status-badge ${member.tier}`}>{member.tier}</span>
      </Col>
    </Row>
  );
}
