# ClubSync

ClubSync replaces the manual Google Forms + spreadsheet workflow that student clubs use to track dues and manage event access. Treasurers run semester groups and review dues, admins create events with a required dues tier, and members can only RSVP to events they're eligible for based on their approved tier — eliminating the manual cross-referencing.

## Authors

- Sean Behan
- Julian Leonhardt

## Class

<!-- TODO: replace with your course link (e.g. the course page / syllabus URL) -->

CS 4530 / Web Development — Northeastern University · [Class Link](https://TODO)

## Project Objective

Clubs waste time every semester copying names into spreadsheets and cross-checking who has paid before letting members into events. ClubSync centralizes this into one app with three roles:

- **Treasurer** — creates a semester group with a join code, reviews dues submissions, and sees a running total of collected dues by tier.
- **Admin** — creates events, sets the dues tier required to attend, and views the RSVP list for each event.
- **Member** — joins a group, submits dues with a tier and payment reference, and RSVPs to events they're eligible for (with a clear message when they're not).

Access is hierarchical: `member < treasurer < admin`.

## Screenshot

<!-- TODO: add a screenshot, e.g. ![ClubSync dashboard](docs/screenshot.png) -->

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (native driver), Passport (local strategy), express-session + connect-mongo
- **Frontend:** React (Vite), React Router, React-Bootstrap, PropTypes
- **Tooling:** ESLint, Prettier

_No Mongoose, Axios, or CORS — the project uses the native MongoDB driver and `fetch`._

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas or local `mongod`)

### 1. Backend

```bash
# from the project root
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```
MONGO_URI=<your MongoDB connection string>
PORT=3000
SESSION_SECRET=<any long random string>
```

Build the frontend so the server can serve it, then start the backend:

```bash
cd frontend && npm install && npm run build && cd ..
npm start
```

The app is served at **http://localhost:3000**.

### 2. Frontend (development mode)

For live-reloading during development, run the Vite dev server in a second terminal:

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** — API requests are proxied to the backend on port 3000.

### 3. Seed the database (1,000+ records)

```bash
npm run seed
```

This populates all four collections with ~1,300 consistent synthetic records (one active semester, ~700 members with realistic dues states, 40 events with eligibility-consistent RSVPs). It is safe to re-run — it only clears its own seed data.

## Login Credentials

After running `npm run seed`, log in with any seeded account. **All seeded accounts use the password `password123`.**

| Role      | Email                                                                      | Password      |
| --------- | -------------------------------------------------------------------------- | ------------- |
| Admin     | `seed.admin@clubsync.test`                                                 | `password123` |
| Treasurer | `seed.treasurer@clubsync.test`                                             | `password123` |
| Member    | `alex.smith0@clubsync.test` (or any `firstname.lastname{n}@clubsync.test`) | `password123` |

New members can also register at `/register` and join the active group with its join code.

## Available Scripts

**Backend (project root):**

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `npm start`    | Start the Express server (nodemon)           |
| `npm run seed` | Populate the database with synthetic records |
| `npm run lint` | Lint the backend                             |

**Frontend (`frontend/`):**

| Command         | Description                 |
| --------------- | --------------------------- |
| `npm run dev`   | Start the Vite dev server   |
| `npm run build` | Build the production bundle |
| `npm run lint`  | Lint the frontend           |

## License

MIT — see [LICENSE](LICENSE).
