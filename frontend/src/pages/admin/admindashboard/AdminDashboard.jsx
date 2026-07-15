import { useState } from "react";
import Container from "react-bootstrap/Container";
import EventForm from "../../events/event-form/EventForm.jsx";
import EventList from "../../events/event-list/EventList.jsx";

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <Container className="px-5">
      <h1 className="moto">Event Management</h1>
      <p className="spacing-after-moto">
        Create events and manage RSVPs for the active semester.
      </p>

      {/* creating an event bumps refreshKey, which remounts the list below */}
      <EventForm onCreated={() => setRefreshKey((k) => k + 1)} />

      <div className="mt-4">
        <EventList key={refreshKey} />
      </div>
    </Container>
  );
}
