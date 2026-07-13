import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useUser } from "../../../context/UserContext.jsx";

// only these two states allow a (re)submission. anyone already pending/approved
// shouldn't be able to submit again.
const SUBMITTABLE = ["not_submitted", "denied"];

export default function DuesStatus() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [tier, setTier] = useState("gold");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState("");
  const [latest, setLatest] = useState(null);

  const canSubmit = SUBMITTABLE.includes(user?.duesStatus || "not_submitted");

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const res = await fetch("/api/dues/mine", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setLatest(data.submission);
      } catch (err) {
        console.error("Failed to load your dues submission", err);
      }
    };
    loadLatest();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/dues/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier, paymentReference }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not submit your dues.");
        return;
      }

      const data = await res.json();

      setUser({ ...user, duesStatus: data.duesStatus, duesTier: tier });
      navigate("/member/member-dashboard");
    } catch (err) {
      console.error("Submit dues request failed", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="dues-status px-5">
      <h1 className="moto">Submit Your Dues</h1>

      {user?.duesStatus === "denied" && latest?.reviewNote && (
        <Alert variant="warning" className="spacing-after-moto">
          <Alert.Heading className="h6">
            Your last submission was denied
          </Alert.Heading>
          <p className="mb-0">{latest.reviewNote}</p>
        </Alert>
      )}

      {!canSubmit ? (
        <p className="spacing-after-moto">
          Your dues are already{" "}
          <strong>{(user?.duesStatus || "").replace("_", " ")}</strong>. There
          is nothing to submit right now.
        </p>
      ) : (
        <Form
          onSubmit={handleSubmit}
          className="mt-3 spacing-after-moto"
        >
          <Form.Group className="mb-3">
            <Form.Label>Membership tier</Form.Label>
            <Form.Select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment reference</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Venmo confirmation #, check number"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
            <Form.Text className="text-muted">
              Helps your treasurer match your payment when verifying.
            </Form.Text>
          </Form.Group>

          {error && <div className="text-danger mb-3">{error}</div>}

          <Button variant="primary" type="submit">
            Submit Dues
          </Button>
        </Form>
      )}
    </div>
  );
}
