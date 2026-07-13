import { Modal, Button, Form } from "react-bootstrap";

// Confirmation modal for the destructive start-new-semester action: warns about
// the roster reset and collects the new term's name before the parent submits.
export default function NewSemesterModal({
  show,
  name,
  setName,
  submitting,
  error,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Start New Semester</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          This creates a new semester with a fresh join code and{" "}
          <strong>detaches every current member</strong>, resetting their dues
          to not submitted. This cannot be undone.
        </p>
        <Form.Group controlId="semesterName">
          <Form.Label>New semester name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Fall 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
          Start Semester
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
