import { Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import SemesterCard from "./SemesterCard.jsx";
import NewSemesterModal from "./NewSemesterModal.jsx";

// Treasurer-only dashboard widget: shows the current semester and its join code,
// and lets the treasurer start a brand-new semester. Starting a semester issues
// a fresh join code and clears the roster — staff carry over, members are
// detached and must re-join. All state lives here; the card and confirm modal
// are presentational children.
export default function NewSemesterWidget() {
  const { user, setUser } = useUser();

  const [active, setActive] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActive = async () => {
      try {
        const res = await fetch("/api/groups/active", {
          credentials: "include",
        });
        if (!res.ok) return;
        setActive(await res.json());
      } catch (err) {
        console.error("Failed to load active semester", err);
      }
    };
    loadActive();
  }, []);

  const openConfirm = () => {
    setName("");
    setError("");
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setShowConfirm(false);
  };

  // creates the new semester and, since staff carry over, moves the acting
  // treasurer onto the new group in context so the dashboard stays live.
  const startSemester = async () => {
    const semesterName = name.trim();
    if (!semesterName) {
      setError("A semester name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/groups/semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: semesterName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Could not start a new semester.");
        return;
      }
      const data = await res.json(); // { id, name, joinCode }
      setActive({ name: data.name, joinCode: data.joinCode });
      setUser({
        ...user,
        groupId: data.id,
        duesStatus: "not_submitted",
        duesTier: "null",
      });
      setShowConfirm(false);
    } catch (err) {
      console.error("Failed to start new semester", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Col xs={12} md={12} lg={12} className="role-card dues-stat-widget">
      <SemesterCard active={active} onStart={openConfirm} />
      <NewSemesterModal
        show={showConfirm}
        name={name}
        setName={setName}
        submitting={submitting}
        error={error}
        onHide={closeConfirm}
        onConfirm={startSemester}
      />
    </Col>
  );
}
