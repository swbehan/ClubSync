// ---------------------------------------------------------------------------
// ClubSync seed script — generates 1k+ synthetic records across all four
// collections (users, groups, events, dues_submissions) with data that stays
// internally consistent: a member's dues status matches a real submission, and
// event RSVP lists only contain members actually eligible for that event.
//
// Run with:  node seed.js         (or `npm run seed`)
//
// Idempotent & safe: every generated doc is tagged { seed: true }. The script
// removes only prior seed docs, so it never touches real/test accounts.
// ---------------------------------------------------------------------------
import bcrypt from "bcrypt";
import mongodb from "mongodb";
import { connect, CLIENT } from "./db/config.js";

const { ObjectId } = mongodb;

// ---- knobs you can tweak ----
const NUM_MEMBERS = 700;
const NUM_EVENTS = 40;

const users = connect("users");
const groups = connect("groups");
const events = connect("events");
const submissions = connect("dues_submissions");

// ---- tiny random helpers ----
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// a Date offset from now by a random number of days within [-range, +range]
const dateWithinDays = (range) =>
  new Date(Date.now() + randInt(-range, range) * 24 * 60 * 60 * 1000);

const FIRST_NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Morgan",
  "Jamie",
  "Drew",
  "Quinn",
  "Avery",
  "Parker",
  "Reese",
  "Skyler",
  "Cameron",
  "Hayden",
  "Emerson",
  "Rowan",
  "Sawyer",
  "Finley",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Lee",
  "Nguyen",
  "Patel",
  "Kim",
];
const EVENT_NAMES = [
  "Season Opener",
  "Weekly Practice",
  "General Body Meeting",
  "Track Day",
  "Social Mixer",
  "Skills Clinic",
  "Race Night",
  "Team Dinner",
  "Fundraiser",
  "Alumni Meetup",
];
const LOCATIONS = [
  "Main Campus Plaza",
  "West Field Hub",
  "Student Center RM 402",
  "Clubhouse",
  "North Track",
  "Rec Center",
];
const TYPES = ["practice", "social", "meeting"];
const TIER_RANK = { none: 0, silver: 1, gold: 2 };

async function seed() {
  console.log("Clearing previous seed data (seed:true only)…");
  await Promise.all([
    users.deleteMany({ seed: true }),
    groups.deleteMany({ seed: true }),
    events.deleteMany({ seed: true }),
    submissions.deleteMany({ seed: true }),
  ]);

  // Pre-generate ids so we can cross-reference before inserting (groups need a
  // creator user id; users need a group id — resolve the cycle up front).
  const activeGroupId = new ObjectId();
  const adminId = new ObjectId();
  const treasurerId = new ObjectId();

  // one shared password hash for every seeded account (fast; login = "password123")
  const passwordHash = await bcrypt.hash("password123", 10);

  // ---- GROUPS: one active "Fall 2026" + three retired semesters ----
  console.log("Seeding groups…");
  // make sure no other group is left active, so findActiveGroup returns ours
  await groups.updateMany({}, { $set: { active: false } });
  const groupDocs = [
    {
      _id: activeGroupId,
      name: "Fall 2026",
      joinCode: "482913",
      createdBy: treasurerId,
      active: true,
      createdAt: new Date(),
      seed: true,
    },
    {
      name: "Spring 2026",
      joinCode: "119274",
      createdBy: treasurerId,
      active: false,
      createdAt: new Date("2026-01-10"),
      seed: true,
    },
    {
      name: "Fall 2025",
      joinCode: "550183",
      createdBy: treasurerId,
      active: false,
      createdAt: new Date("2025-09-02"),
      seed: true,
    },
    {
      name: "Spring 2025",
      joinCode: "738421",
      createdBy: treasurerId,
      active: false,
      createdAt: new Date("2025-01-14"),
      seed: true,
    },
  ];
  await groups.insertMany(groupDocs);

  // ---- USERS: 1 admin, 1 treasurer, NUM_MEMBERS members ----
  console.log(`Seeding ${NUM_MEMBERS + 2} users…`);
  const baseUser = (id, role, extra) => ({
    _id: id,
    email: extra.email,
    passwordHash,
    firstName: extra.firstName,
    lastName: extra.lastName,
    role,
    groupId: activeGroupId, // everyone belongs to the active semester
    duesStatus: extra.duesStatus ?? "not_submitted",
    duesTier: extra.duesTier ?? "null",
    createdAt: new Date(),
    seed: true,
  });

  const userDocs = [
    baseUser(adminId, "admin", {
      email: "seed.admin@clubsync.test",
      firstName: "Ada",
      lastName: "Admin",
      duesStatus: "approved",
      duesTier: "gold",
    }),
    baseUser(treasurerId, "treasurer", {
      email: "seed.treasurer@clubsync.test",
      firstName: "Tara",
      lastName: "Treasurer",
      duesStatus: "approved",
      duesTier: "gold",
    }),
  ];

  // members get a realistic spread of dues states
  const memberSubmissions = [];
  for (let i = 0; i < NUM_MEMBERS; i++) {
    const memberId = new ObjectId();
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const email = `${firstName}.${lastName}${i}@clubsync.test`.toLowerCase();

    // roll a dues state: 45% approved, 20% pending, 10% denied, 25% not submitted
    const roll = Math.random();
    let duesStatus, duesTier;
    if (roll < 0.45) {
      duesStatus = "approved";
      duesTier = pick(["silver", "gold"]);
    } else if (roll < 0.65) {
      duesStatus = "pending";
      duesTier = pick(["silver", "gold"]);
    } else if (roll < 0.75) {
      duesStatus = "denied";
      duesTier = pick(["silver", "gold"]);
    } else {
      duesStatus = "not_submitted";
      duesTier = "null";
    }

    userDocs.push(
      baseUser(memberId, "member", {
        email,
        firstName,
        lastName,
        duesStatus,
        duesTier,
      })
    );

    // anyone who submitted (not "not_submitted") gets a matching submission record
    if (duesStatus !== "not_submitted") {
      const reviewed = duesStatus !== "pending";
      memberSubmissions.push({
        userId: memberId,
        groupId: activeGroupId,
        tier: duesTier,
        paymentReference: `VENMO-${randInt(10000, 99999)}`,
        status: duesStatus,
        reviewNote:
          duesStatus === "denied" ? "Payment reference did not match." : null,
        reviewedBy: reviewed ? treasurerId : null,
        submittedAt: dateWithinDays(30),
        reviewedAt: reviewed ? new Date() : null,
        seed: true,
      });
    }
  }
  await users.insertMany(userDocs);

  // ---- DUES SUBMISSIONS ----
  console.log(`Seeding ${memberSubmissions.length} dues submissions…`);
  await submissions.insertMany(memberSubmissions);

  // members only (exclude admin/treasurer) for RSVP pools
  const members = userDocs.filter((u) => u.role === "member");

  // ---- EVENTS + consistent RSVPs ----
  console.log(`Seeding ${NUM_EVENTS} events…`);
  const eventDocs = [];
  for (let i = 0; i < NUM_EVENTS; i++) {
    const requiredTier = pick(["none", "none", "silver", "gold"]); // weight toward open
    // eligibility mirrors the backend: "none" open to all; tiered needs approved + rank
    const eligible = members.filter((m) => {
      if (requiredTier === "none") return true;
      if (m.duesStatus !== "approved") return false;
      return (TIER_RANK[m.duesTier] ?? 0) >= TIER_RANK[requiredTier];
    });
    // random subset of eligible members RSVP
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const rsvps = shuffled
      .slice(0, randInt(0, Math.min(40, eligible.length)))
      .map((m) => m._id);

    eventDocs.push({
      groupId: activeGroupId,
      name: `${pick(EVENT_NAMES)} #${i + 1}`,
      type: pick(TYPES),
      date: dateWithinDays(60),
      location: pick(LOCATIONS),
      requiredTier,
      createdBy: adminId,
      rsvps,
      createdAt: new Date(),
      seed: true,
    });
  }
  await events.insertMany(eventDocs);

  // ---- summary ----
  const total =
    groupDocs.length +
    userDocs.length +
    memberSubmissions.length +
    eventDocs.length;
  console.log("\n=== Seed complete ===");
  console.log(`  groups:            ${groupDocs.length}`);
  console.log(`  users:             ${userDocs.length}`);
  console.log(`  dues_submissions:  ${memberSubmissions.length}`);
  console.log(`  events:            ${eventDocs.length}`);
  console.log(
    `  TOTAL records:     ${total}  ${total >= 1000 ? "✅ (≥1000)" : "⚠️ under 1000"}`
  );
  console.log("\n  Log in as any seeded account with password: password123");
  console.log("  e.g. seed.admin@clubsync.test / seed.treasurer@clubsync.test");
}

try {
  await seed();
} catch (error) {
  console.error("Seeding failed:", error);
} finally {
  await CLIENT.close();
}
