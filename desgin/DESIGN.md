# ClubSync — Design Document

**Team:** Sean Behan, Julian Leonhardt
**Course:** CS 5610 / Web Development — Northeastern University

---

## Project Description

From Sean's experience as the treasurer of a club at Northeastern, a lot of monotonous work comes from the Google Forms + spreadsheet workflow used to track dues and manage event access. Every semester means copying names into a fresh spreadsheet and manually cross-referencing who has paid before letting members into events.

**ClubSync** replaces that workflow with one app built around three roles:

- An **admin** creates and runs a club, creates events, and sets which dues tier is required to attend each one.
- A **treasurer** reviews dues submissions and sees a running total of what's been collected.
- A **member** joins a club, submits their dues, and can only RSVP to events they're eligible for based on their approved tier.

Authentication is handled with **Passport** (local strategy, session-based). Eligibility is enforced automatically by the server, so no one has to cross-check a spreadsheet.

### Mockups

- Can be found [here](/desgin/ClubSync-Design%20Mockups.pdf)

### Core concepts

- **Multi-club.** The app hosts many independent clubs at once. Each club is its own world — its own members, join code, events, and dues — and users only ever see data for their own club.
- **Roles are hierarchical:** `member < treasurer < admin`. At registration you choose **Member** (join an existing club) or **Admin** (create a club). **Treasurer is never self-selected** — an admin grants it to an existing member.
- **Dues tiers:** `silver` and `gold` (with `none` meaning "open to all" for events). A member "holds" a tier only once their dues are **approved** at it.
- **Semesters are a reset, not a new club.** Starting a new semester keeps the same club but regenerates its join code and clears the roster, so members re-join and dues reset for the new term.

---

## Features (CRUD)

**Create**

- An admin **registers and creates a club** (which generates a join code).
- A member **joins a club** by entering its join code.
- A member **submits a dues request** (tier + payment reference).
- An admin **creates an event** and sets the required dues tier.
- A member **RSVPs** to an event they're eligible for.

**Read**

- A treasurer **views pending dues submissions** (tier + payment reference) and a **running total of collected dues broken down by tier**.
- An admin **views their club's events** and each event's **RSVP list**.
- A member sees a **dashboard** with their dues status, their club, and the events they can explore.

**Update**

- A treasurer **approves or denies** a dues submission (a denial **requires a note**); on approval the member's **tier is set**, unlocking eligible events.
- An admin **edits an event's** details.
- An admin **promotes a member** to treasurer or admin.
- A treasurer **starts a new semester** (regenerates the join code, clears the roster, resets dues) — an update to the existing club, not a new one.

**Delete**

- A member **withdraws** their own still-pending dues submission.
- An admin **cancels (deletes) an event**.

---

## User Personas

**Treasurer**
_Goal:_ Stop copying names into a spreadsheet every semester and have one place to see who's paid and how much has come in.
_Needs:_ To review dues submissions with each member's tier and payment reference, approve or deny them, see a running total of collected dues, and reset the club for a new semester.

**Admin**
_Goal:_ Create and manage club events without cross-referencing a separate dues spreadsheet to figure out who's allowed to attend.
_Needs:_ To create a club, create events with a required dues tier, see who's RSVP'd, and appoint trusted members as treasurers/admins.

**Member**
_Goal:_ Join the club, submit dues, and sign up for events without hitting a wall because someone forgot to update a spreadsheet.
_Needs:_ To join a club with a code, submit a dues request with a tier and payment reference, see their approval status, and RSVP to events they're eligible for.

---

## User Stories

**Register and create a club** — As a new officer, I want to register as an admin and name my club in one step, so I have a club with a shareable join code from the start.

**Join a club** — As a member, I want to enter a join code to join a club so I can start the dues process without emailing the treasurer directly.

**Submit dues** — As a member, I want to submit a dues request by selecting my tier and entering my payment reference, so the treasurer can verify and approve me.

**Withdraw a submission** — As a member, I want to withdraw my dues request while it's still pending, in case I entered the wrong tier or reference.

**Review a dues submission** — As a treasurer, I want to see all pending submissions with each member's tier and payment reference, so I can approve or deny them with a short note.

**View a dues summary** — As a treasurer, I want a running total of what's been collected this semester broken down by tier, so I don't have to tally a spreadsheet.

**Create an event** — As an admin, I want to create an event and set which dues tier is required to attend, so eligibility is enforced automatically.

**RSVP to an event** — As a member, I want to see upcoming events on my dashboard and RSVP to the ones I'm eligible for. If I'm not eligible, I want a clear message telling me why, so I know to submit dues.

**View an RSVP list** — As an admin, I want to see who's RSVP'd to each event so I can plan logistics without checking a separate list.

**Appoint officers** — As an admin, I want to promote an existing member of my club to treasurer or admin, so I can share the workload.

**Start a new semester** — As a treasurer, I want to reset my club for a new semester with a fresh join code, so dues statuses reset and members re-join for the new term.

---

## Data Model (MongoDB Collections)

Four collections. The **users** schema is the key shared dependency: event eligibility reads a user's `duesStatus`/`duesTier`.

**users**

```json
{
  "_id": "ObjectId",
  "email": "string",
  "passwordHash": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "member | treasurer | admin",
  "groupId": "ObjectId (ref: groups) | null",
  "duesStatus": "not_submitted | pending | approved | denied",
  "duesTier": "silver | gold | null",
  "createdAt": "Date"
}
```

**dues_submissions**

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "groupId": "ObjectId (ref: groups)",
  "tier": "silver | gold",
  "paymentReference": "string",
  "status": "pending | approved | denied | archived",
  "reviewNote": "string | null",
  "reviewedBy": "ObjectId (ref: users) | null",
  "submittedAt": "Date",
  "reviewedAt": "Date | null"
}
```

**groups**

```json
{
  "_id": "ObjectId",
  "name": "string (e.g. Chess Club - Fall 2026)",
  "joinCode": "string",
  "createdBy": "ObjectId (ref: users)",
  "active": "boolean",
  "createdAt": "Date"
}
```

**events**

```json
{
  "_id": "ObjectId",
  "groupId": "ObjectId (ref: groups)",
  "name": "string",
  "type": "practice | social | meeting",
  "date": "Date",
  "location": "string",
  "requiredTier": "none | silver | gold",
  "createdBy": "ObjectId (ref: users)",
  "rsvps": ["ObjectId (ref: users)"],
  "createdAt": "Date"
}
```

---

## API Routes

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/user`

**Dues** — `POST /api/dues/submit`, `GET /api/dues/mine`, `GET /api/dues/pending/:groupId/:limit`, `GET /api/dues/stats/:groupId`, `PATCH /api/dues/review/:submissionId`, `DELETE /api/dues/:submissionId`

**Groups** — `GET /api/groups/:id`, `POST /api/groups/join`, `POST /api/groups/semester`, `PUT /api/groups/:id`

**Events** — `GET /api/events`, `POST /api/events`, `GET /api/events/mine`, `GET /api/events/:id`, `PUT /api/events/:id`, `DELETE /api/events/:id`, `POST /api/events/:id/rsvp`, `GET /api/events/:id/rsvps`

All data-bearing reads/writes are **scoped to the requester's `groupId`**, so users can never see or act on another club's data.

---

## Work Division

**Sean Behan — Members + Auth (full stack)**

- Registration, login, logout via Passport
- Member dashboard (dues status, club info, eligible events + RSVP)
- Dues submission form and status/denial feedback
- Treasurer dues review UI (approve/deny with note) and dues summary
- Collections: **users**, **dues_submissions**
- React: `AuthForm` (login/register), `DuesStatus`, `DuesWidget`, `DuesVerificationWidget`, `DuesStatWidget`, `MemberDashboard`, shared `WidgetCard` / `PreviewList`

**Julian Leonhardt — Groups + Events (full stack)**

- Club/join-code logic and semester reset
- Admin event creation with a tier requirement, and event editing
- Event listing and RSVP eligibility logic (reads dues status)
- Admin RSVP list view
- Collections: **groups**, **events**
- React: `EventForm`, `EventList`, `EventDetail`, `EventEditForm`, `RSVPButton`

**Shared**

- MongoDB schema agreement upfront (the `users` schema is the cross-cutting dependency)
- Passport session configuration
- Shared CSS structure and overall app style (per-component CSS + shared `styles/`)
- A seed script generating **1,000+ internally-consistent synthetic records** (users, dues submissions, events, RSVPs) across multiple clubs

---

## Tech Stack

- **Server:** Node.js + Express (ES modules)
- **Database:** MongoDB via the native driver (no Mongoose)
- **Auth:** Passport (local) + bcrypt; sessions in MongoDB via connect-mongo
- **Frontend:** React + Vite, React Router, React-Bootstrap, PropTypes; native `fetch` (no Axios, no CORS — same-origin)
- **Tooling:** ESLint + Prettier
