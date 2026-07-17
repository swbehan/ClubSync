// ---------------------------------------------------------------------------
// Wipes every ClubSync collection for a clean slate. Uses the same connection
// as the app (db/config.js), so it targets whatever MONGO_URI points at.
//
// Run with:  npm run db:reset      (then `npm run seed` for fresh data)
// ---------------------------------------------------------------------------
import { connect, CLIENT } from "./db/config.js";

const COLLECTIONS = [
  "users",
  "groups",
  "events",
  "dues_submissions",
  "sessions",
];

async function reset() {
  for (const name of COLLECTIONS) {
    const result = await connect(name).deleteMany({});
    console.log(`Cleared ${name}: ${result.deletedCount} removed`);
  }
}

try {
  await reset();
  console.log("\nDatabase reset complete. Run `npm run seed` for fresh data.");
} catch (error) {
  console.error("Reset failed:", error);
} finally {
  await CLIENT.close();
}
