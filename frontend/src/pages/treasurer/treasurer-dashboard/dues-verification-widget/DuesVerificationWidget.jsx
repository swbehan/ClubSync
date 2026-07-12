import { Col, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext.jsx";

// dashboard preview of the dues verification queue: the 5 longest-waiting pending
// submissions. the same /api/dues/pending route drives the eventual full-list view
// by asking for a larger limit.
const PREVIEW_LIMIT = 5;

export default function DuesVerificationWidget() {
  const [pending, setPending] = useState([]);
  const [total, setTotal] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.groupId) return;
    const loadPending = async () => {
      try {
        const res = await fetch(
          `/api/dues/pending/${user.groupId}/${PREVIEW_LIMIT}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setPending(data.pending);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load pending dues", err);
      }
    };
    loadPending();
  }, [user?.groupId]);

  return (
    <Col xs={12} md={12} lg={12} className="role-card dues-stat-widget">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>Pending Dues Verification</Card.Title>
          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            Members Awaiting Approval
            <span className="status-badge approved">{total} Pending</span>
          </Card.Subtitle>

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
                    <Row
                      key={member.submissionId}
                      className="align-items-center gx-2 py-1"
                    >
                      <Col
                        xs={2}
                        className="inner-card-context small text-muted text-truncate"
                      >
                        {member.firstName} {member.lastName}
                      </Col>
                      <Col
                        xs={7}
                        className="inner-card-context small text-muted text-truncate"
                      >
                        {member.email}
                      </Col>
                      <Col xs={3} className="text-end">
                        <span className={`status-badge ${member.tier}`}>
                          {member.tier}
                        </span>
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Card.Body>
          </Card>
        </Card.Body>
        <span>Only displays up to 5 members with the oldest dues submissions</span>
        <span>To view all dues submissions navigate to the dues tab on the nav bar</span>
      </Card>
    </Col>
  );
}
