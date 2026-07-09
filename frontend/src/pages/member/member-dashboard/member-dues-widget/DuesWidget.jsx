import { Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import InnerDuesCard from "./InnerDuesCard";
import "./dues-widget.css";

const TIER_LABELS = {
  silver: "Silver",
  gold: "Gold",
};

const DUES_CONTENT_MAP = {
  pending: {
    header: "Awaiting Approval",
    subheader: "Review Pending",
    context: "An admin is currently verifying your submission.",
  },
  approved: {
    header: "Account Active",
    subheader: "Paid & Verified",
    context: "Membership in good standing until the end of semester.",
  },
  denied: {
    header: "Action Required",
    subheader: "Submission Denied",
    context: "Please contact an admin or retry your submission.",
  },
  not_submitted: {
    header: "Next Payment Due",
    subheader: "No Submissions",
    context: "Submit your dues to your club to participate in events.",
  },
};

export default function DuesWidget({ user }) {
  const statusKey = user?.duesStatus || "not_submitted";
  const content = DUES_CONTENT_MAP[statusKey];

  return (
    <Col xs={12} md={6} lg={5} className="role-card">
      <Card className="h-100 dues-card d-flex flex-column justify-content-between">
        <Card.Body className="d-flex flex-column">
          <Card.Title>Financial Overview</Card.Title>

          <Card.Subtitle className="mb-2 d-flex align-items-center justify-content-between w-100">
            Dues Status{" "}
            <span className={`status-badge ${statusKey}`}>
              {(user?.duesStatus || "Unknown").replace("_", " ")}
            </span>
          </Card.Subtitle>

          <Card.Text className="d-flex align-items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/128/10235/10235354.png"
              className="dues-tier-style"
              alt="shield with checkmark indicating dues status"
            />
            <span>Tier: {TIER_LABELS[user?.duesTier] || "None"}</span>
          </Card.Text>

          <Card className="dues-inner-card mt-auto">
            <Card.Body>
                <InnerDuesCard componentInfo={content}/>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Col>
  );
}
