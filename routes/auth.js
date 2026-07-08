import { Router } from "express";
import passport from "passport";
import usersCollection from "../db/users-db.js";
import { isAuthenticated } from "../middleware/auth.js";

const authRouter = Router();

// ----------------------------
// USER REGISTRATION
// ----------------------------
authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "All fields are required to register" });
    }

    const user = await usersCollection.registerUser({ email, password, name });
    if (!user) {
      return res.status(400).json({ message: "User already exists" });
    }

    res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error registering user", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// ----------------------------
// POST USER LOGIN
// ----------------------------
authRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// ----------------------------
// GET CURRENT USER PROFILE
// ----------------------------
authRouter.get("/user", isAuthenticated, (req, res) => {
  const noPasswordUser = {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
  };
  res.json({ user: noPasswordUser });
});

// ----------------------------
// POST USER LOGOUT
// ----------------------------
authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Logout failed", error: err.message });
    }
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Logout failed", error: err.message });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
});

export default authRouter;
