import { Router } from "express";
import eventsCollection from "../db/events-db.js";
import groupsCollection from "../db/groups-db.js"; // to find the active group
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import usersCollection from "../db/users-db.js";

const eventRouter = Router();
const TIER_RANK = { none: 0, silver: 1, gold: 2 };

// Decide whether a user may RSVP. Returns a clear reason on failure so the UI
// can tell the member exactly WHY (your proposal calls for this).
function checkEligibility(user, event) {
  // "none" events are open to everyone — no dues required.
  if (event.requiredTier === "none") {
    return { eligible: true };
  }
  // Tiered events require approved dues first.
  if (user.duesStatus !== "approved") {
    return {
      eligible: false,
      reason: "You must have approved dues to RSVP for this event.",
    };
  }
  // And your approved tier must meet the event's required tier.
  const userRank = TIER_RANK[user.duesTier] ?? 0; // "null"/undefined → 0
  const requiredRank = TIER_RANK[event.requiredTier] ?? 0;
  if (userRank < requiredRank) {
    return {
      eligible: false,
      reason: `This event requires the ${event.requiredTier} tier.`,
    };
  }
  return { eligible: true };
}

eventRouter.get("/", isAuthenticated, async (req, res) => {
  try {
    const activeGroup = await groupsCollection.findActiveGroup();
    if (!activeGroup) {
      return res.json([]);
    }
    const events = await eventsCollection.getEventsByGroup(activeGroup._id);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.post("/", requireRole("admin"), async (req, res) => {
  try {
    const { name, type, date, location, requiredTier } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: "Name and date are required" });
    }

    const activeGroup = await groupsCollection.findActiveGroup();
    if (!activeGroup) {
      return res
        .status(400)
        .json({ message: "No active group to attach the event to" });
    }

    const result = await eventsCollection.createEvent({
      groupId: activeGroup._id,
      name,
      type,
      date: new Date(date),
      location,
      requiredTier: requiredTier || "none",
      createdBy: req.user._id,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/events/mine — events in the active group the current user RSVP'd to.
// MUST stay above "/:id" or Express treats "mine" as an event id.
eventRouter.get("/mine", isAuthenticated, async (req, res) => {
  try {
    const activeGroup = await groupsCollection.findActiveGroup();
    if (!activeGroup) {
      return res.json([]);
    }
    const events = await eventsCollection.getEventsForUser(
      req.user._id,
      activeGroup._id
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching your RSVPs", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.put("/:id", requireRole("admin"), async (req, res) => {
  try {
    const { name, type, date, location, requiredTier } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (type !== undefined) update.type = type;
    if (date !== undefined) update.date = new Date(date);
    if (location !== undefined) update.location = location;
    if (requiredTier !== undefined) update.requiredTier = requiredTier;
    const updated = await eventsCollection.updateEvent(req.params.id, update);
    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const deleteCount = await eventsCollection.deleteEvent(req.params.id);
    if (!deleteCount) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event cancelled" });
  } catch (error) {
    console.error("Error deleting event", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.post("/:id/rsvp", isAuthenticated, async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { eligible, reason } = checkEligibility(req.user, event);
    if (!eligible) {
      // 403 = "we know who you are, you're just not allowed" — with the reason.
      return res.status(403).json({ message: reason });
    }

    const updated = await eventsCollection.addRsvp(req.params.id, req.user._id);
    res.json(updated);
  } catch (error) {
    console.error("Error creating RSVP", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

eventRouter.get("/:id/rsvps", requireRole("admin"), async (req, res) => {
  try {
    const event = await eventsCollection.findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // event.rsvps is an array of user ObjectIds — look them all up in one query.
    const users = await usersCollection.findUsersByIds(event.rsvps);

    // Build a CLEAN list — never leak passwordHash to the client.
    const attendees = users.filter(Boolean).map((u) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      duesTier: u.duesTier,
    }));

    res.json(attendees);
  } catch (error) {
    console.error("Error fetching RSVP list", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default eventRouter;
