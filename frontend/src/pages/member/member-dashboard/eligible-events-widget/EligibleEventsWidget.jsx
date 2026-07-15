import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import WidgetCard from "../../../../components/widget/WidgetCard.jsx";
import PreviewList from "../../../../components/widget/PreviewList.jsx";
import EventRsvpModal from "./EventRsvpModal.jsx";
import PropTypes from "prop-types";

const TIER_RANK = { none: 0, silver: 1, gold: 2 };

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

// tier badge ("Open" when anyone may attend).
const tierBadge = (tier) => {
  const value = tier ?? "none";
  return (
    <span className={`status-badge ${value}`}>
      {value === "none" ? "Open" : value}
    </span>
  );
};

// column config for the events list
const COLUMNS = [
  { label: "Event", size: 5, render: (e) => e.name },
  { label: "Date", size: 4, render: (e) => formatDate(e.date) },
  {
    label: "Required Tier",
    size: 3,
    align: "end",
    render: (e) => tierBadge(e.requiredTier),
  },
];

// Member dashboard widget listing the club's events. Rows are clickable and open
// a modal with the event's details plus an RSVP action, gated by the member's
// dues tier. previewLimit > 0 caps the list (e.g. 5 on the dashboard); <= 0
// shows every event.
export default function EligibleEventsWidget({ previewLimit = 0 }) {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  // a member only "holds" a tier once their dues are approved at it; otherwise
  // they can only attend open (requiredTier: none) events.
  const memberRank =
    user?.duesStatus === "approved" ? (TIER_RANK[user.duesTier] ?? 0) : 0;
  const isEligible = (event) =>
    memberRank >= (TIER_RANK[event?.requiredTier] ?? 0);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch("/api/events", { credentials: "include" });
        if (!res.ok) return;
        setEvents(await res.json());
      } catch (err) {
        console.error("Failed to load events", err);
      }
    };
    loadEvents();
  }, []);

  // previewLimit > 0 caps the dashboard preview; <= 0 shows every event.
  const isPreview = previewLimit > 0;
  const visible = isPreview ? events.slice(0, previewLimit) : events;

  return (
    <>
      <WidgetCard
        title="Upcoming Events"
        subtitle="Events You Can Explore"
        badge={`${events.length} Events`}
        footer={
          isPreview && (
            <>
              <span>
                Only displays up to {previewLimit} of the soonest events
              </span>
              <span>
                To view all events navigate to the events tab on the nav bar
              </span>
            </>
          )
        }
      >
        <PreviewList
          columns={COLUMNS}
          items={visible}
          total={events.length}
          emptyMessage="No events have been scheduled yet."
          onSelect={setSelected}
          rowKey={(e) => e._id}
        />
      </WidgetCard>

      <EventRsvpModal
        event={selected}
        show={!!selected}
        eligible={selected ? isEligible(selected) : false}
        onHide={() => setSelected(null)}
      />
    </>
  );
}

EligibleEventsWidget.propTypes = {
  previewLimit: PropTypes.number,
};
