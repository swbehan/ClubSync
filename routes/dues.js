import { Router } from "express";
import usersCollection from "../db/users-db.js";
import { isAuthenticated } from "../middleware/auth.js";

const duesRouter = Router();

// ----------------------------
// POST DUES SUBMISSION
// ----------------------------
duesRouter.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const updated = await usersCollection.submitDues(req.user._id, req.user.duesTier);
    if (!updated) {
      return res.status(409).json({ message: "Dues already submitted" });
    }
    res.json({ duesStatus: updated.duesStatus });
  } catch (error) {
    console.error("Error submitting dues", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default duesRouter;
