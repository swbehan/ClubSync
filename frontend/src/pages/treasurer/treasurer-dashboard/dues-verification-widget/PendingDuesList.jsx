import { Col, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import PendingDuesRow from "./PendingDuesRow.jsx";

export default function PendingDuesList({
  pending,
  total,
  isPreview,
  onSelect,
}) {
  return (
    <Card className="dues-inner-card mt-auto">
      <Card.Body className="p-3">
        {total === 0 ? (
          <div className="inner-card-context small text-muted">
            No members are awaiting dues approval.
          </div>
        ) : (
          <>
            <Row className="inner-card-header text-uppercase gx-2">
              <Col xs={2}>Name</Col>
              <Col xs={7}>Email</Col>
              <Col xs={3} className="text-end">
                Dues Tier
              </Col>
            </Row>
            <hr className="dues-stat-divider my-2" />

            {pending.map((member) => (
              <PendingDuesRow
                key={member.submissionId}
                member={member}
                isPreview={isPreview}
                onSelect={onSelect}
              />
            ))}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
