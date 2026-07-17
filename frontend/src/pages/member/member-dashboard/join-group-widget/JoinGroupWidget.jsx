import { Col } from "react-bootstrap";
import { useState } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import JoinGroupCard from "./JoinGroupCard.jsx";

// Member dashboard widget for joining the club by entering the active semester's
// join code.
export default function JoinGroupWidget() {
  const { user, setUser } = useUser();

  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code) {
      setError("A join code is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ joinCode: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Could not join the club.");
        return;
      }
      const data = await res.json();
      setUser({ ...user, groupId: data.groupId });
    } catch (err) {
      console.error("Failed to join club", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Col xs={12} md={6} lg={5} className="role-card member-dues-widget">
      <JoinGroupCard
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    </Col>
  );
}
