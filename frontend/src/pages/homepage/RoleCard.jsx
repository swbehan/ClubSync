import { Col } from "react-bootstrap";

export default function RoleCard({ title, text }) {
  return (
    <Col xs={12} md={4} className="role-card">
      <h3 className="role-title">{title}</h3>
      <p className="lead-text">{text}</p>
    </Col>
  );
}
