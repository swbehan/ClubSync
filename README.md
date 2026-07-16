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

- **Runtime / Server:** Node.js + Express (ES modules)
- **Database:** MongoDB (native MongoDB Node.js driver — no Mongoose)
- **Authentication / Sessions:** Passport (local strategy) with bcrypt password hashing; express-session backed by connect-mongo (sessions stored in MongoDB)
- **Frontend:** React 19 with client-side rendering, built with Vite; React Router for routing; PropTypes for prop validation
- **HTTP:** the browser's native `fetch` (no Axios); no CORS (frontend is served by the same Express server, proxied in dev)
- **Styling:** Bootstrap 5.3 + React-Bootstrap components, plus per-component CSS files
- **Tooling:** ESLint + Prettier; nodemon for dev auto-restart; dotenv for environment config
- **Synthetic data:** a custom Node.js seed script (`npm run seed`) that generates ~1,300 internally-consistent records directly via the MongoDB driver (no external generator)

_Deliberately avoids the prohibited libraries: no Mongoose, no Axios, no CORS._

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

| Role                     | Email                          | Password      |
| ------------------------ | ------------------------------ | ------------- |
| Admin                    | `seed.admin@clubsync.test`     | `password123` |
| Treasurer                | `seed.treasurer@clubsync.test` | `password123` |
| Member — approved gold   | `finley.nguyen4@clubsync.test` | `password123` |
| Member — approved silver | `parker.lee0@clubsync.test`    | `password123` |
| Member — no dues yet      | `casey.brown1@clubsync.test`   | `password123` |

The three member accounts have different dues states, which is handy for demonstrating event RSVP eligibility (a gold-tier event accepts the gold member, blocks the silver and no-dues members). New members can also register at `/register` and join the active group with its join code.

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

## AI Use Disclosure

-Julian

I used an AI assistant (Claude Code, by Anthropic) during development, primarily as a **mentor/tutor rather than a code generator**.

**Initial prompt.** I set up the collaboration explicitly at the start:

> Act as my professor and someone who has 15 years of experince as a full-stack developer help me with the concepts of the project. I will be writting all of the code unless I specificly ask you to which will only be for boilerplate.

I also gave it the project proposal so that the agent understood the role I was given and the ideas I had to work on.

**How I used it:**

- **I wrote most of the code myself.** For each feature the assistant explained the approach and structure, I implemented it, and then it reviewed my drafts — catching bugs (missing `await`, field-name mismatches, scope/bracket errors, template-literal vs. single-quote mistakes) and explaining the concepts behind them (React hooks, controlled inputs, `useEffect`, Express routing/middleware, MongoDB queries, HTTP status codes).
- **I asked it to write some boilerplate/tooling for me** — the database seed script, a few component templates and the CSS styling, and this README — all of which I reviewed before keeping.
- **Testing/tooling:** it ran linting, formatting, and end-to-end tests, and helped debug by exercising the API directly.
- **Design decisions** (role hierarchy, event/dues eligibility rules, keeping seeded data consistent) were talked through and decided by mex.

I reviewed and understood the final code and architectural choices for my portion.

## License

MIT — see [LICENSE](LICENSE).
