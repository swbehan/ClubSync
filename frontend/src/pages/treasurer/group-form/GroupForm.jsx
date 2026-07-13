// --- Imports -------------------------------------------------------------
// useState is a "hook" — it lets a function component remember values
// between renders (the text typed, an error, the created group).
import { useState } from "react";
// PropTypes documents + validates the props this component accepts (rubric item).
import PropTypes from "prop-types";
// Prebuilt Bootstrap-styled UI pieces, same ones AuthForm uses.
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
// The component's own stylesheet (empty for now; we'll fill it in later).
import "./groupform.css";

// A React component is just a function that returns JSX (HTML-like markup).
// `{ onCreated }` destructures the single prop a parent can pass in — a
// callback we'll call after a group is created (e.g. so a list can refresh).
export default function GroupForm({ onCreated }) {
  // --- State ---------------------------------------------------------------
  // Each useState call returns [currentValue, setterFunction].
  // Calling the setter re-renders the component with the new value.
  const [name, setName] = useState(""); // the controlled input's text
  const [error, setError] = useState(""); // message shown when creation fails
  const [createdGroup, setCreatedGroup] = useState(null); // the created group, or null

  // --- Submit handler ------------------------------------------------------
  // Runs when the form is submitted. `async` because we await the network call.
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default full-page form reload
    setError(""); // clear any error from a previous attempt

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send the session cookie so the server knows who we are
        body: JSON.stringify({ name }), // { name } === { name: name }
      });

      // res.ok is true for 2xx responses. If not, read the server's message.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not create group.");
        return; // bail out — don't run the success code below
      }

      const data = await res.json(); // the created group: { id, name, joinCode }
      setCreatedGroup(data); // remember it so we can show the join code
      setName(""); // clear the input for the next group
      if (onCreated) onCreated(data); // tell the parent, if it asked to be told
    } catch (err) {
      // Network/parsing failure (server down, etc.)
      console.error("Create group request failed", err);
      setError("Something went wrong. Please try again.");
    }
  };

  // --- UI ------------------------------------------------------------------
  return (
    <div className="group-form">
      <h2 className="moto">Create a Group</h2>

      {/* onSubmit fires on button click OR Enter key inside the form */}
      <Form onSubmit={handleSubmit} className="spacing-after-moto">
        <Form.Group className="mb-3">
          <Form.Label>Group name</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Fall 2026"
            value={name} // input always displays the state ("controlled")
            onChange={(e) => setName(e.target.value)} // every keystroke updates state
          />
        </Form.Group>

        {/* Show the error only when there is one. `&&` renders the right
            side only if the left side is truthy. */}
        {error && <div className="text-danger mb-3">{error}</div>}

        <Button variant="primary" type="submit">
          Create Group
        </Button>
      </Form>

      {/* Success panel: renders only after a group has been created. */}
      {createdGroup && (
        <div className="join-code-panel mt-4">
          <p>Group created! Share this join code with members:</p>
          <strong className="join-code">{createdGroup.joinCode}</strong>
        </div>
      )}
    </div>
  );
}

// --- PropTypes -------------------------------------------------------------
// Declares that `onCreated` (if passed) must be a function. Not required,
// so no `.isRequired`.
GroupForm.propTypes = {
  onCreated: PropTypes.func,
};
