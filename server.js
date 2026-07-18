// core framework modules
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";

// session and auth dependencies
import session from "express-session";
import MongoStore from "connect-mongo";
import { CLIENT, DB_NAME } from "./db/config.js";
import passport from "./config/passport.js";

// app routers
import authRouter from "./routes/auth.js";
import duesRouter from "./routes/dues.js";
import groupsRouter from "./routes/groups.js";
import eventsRouter from "./routes/events.js";
import usersRouter from "./routes/users.js";

// ----------------------------
// SERVER CONSTANTS
// ----------------------------
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------------
// PROXY CONFIGURATION
// ----------------------------
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ----------------------------
// REQUEST MIDDLEWARE
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------
// SESSION CONFIGURATION
// ----------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: CLIENT,
      dbName: DB_NAME,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ----------------------------
// PASSPORT INITIALIZATION
// ----------------------------
app.use(passport.initialize());
app.use(passport.session());

// ----------------------------
// ROUTES & STATIC ASSETS
// ----------------------------
app.use("/", express.static("./frontend/dist"));
app.use("/api/auth", authRouter);
app.use("/api/dues", duesRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/users", usersRouter);

// ----------------------------
// SPA CATCH-ALL ROUTING
// ----------------------------
app.get("*splat", function (req, res) {
  res.sendFile("index.html", { root: join(__dirname, "./frontend/dist") });
});

// ----------------------------
// SERVER INITIALIZATION
// ----------------------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
