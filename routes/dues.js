import { Router } from "express";
import usersCollection from "../db/users-db.js";
import duesSubmissionsCollection from "../db/dues-submissions-db.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const duesRouter = Router();

// ----------------------------
// POST DUES SUBMISSION
// ----------------------------
duesRouter.post("/submit", isAuthenticated, async (req, res) => {
  try {
    const { tier, paymentReference } = req.body ?? {};

    if (!["gold", "silver"].includes(tier)) {
      return res
        .status(400)
        .json({ message: "A gold or silver tier is required" });
    }

    if (!req.user.groupId) {
      return res
        .status(400)
        .json({ message: "Join a club before submitting dues" });
    }

    const updated = await usersCollection.submitDues(req.user._id, tier);
    if (!updated) {
      return res.status(409).json({ message: "Dues already submitted" });
    }

    const submission = await duesSubmissionsCollection.createSubmission({
      userId: req.user._id,
      groupId: updated.groupId,
      tier: updated.duesTier,
      paymentReference: paymentReference ?? null,
    });

    res.json({ duesStatus: updated.duesStatus, submissionId: submission?.id });
  } catch (error) {
    console.error("Error submitting dues", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ----------------------------
// GET DUES STATS
// ----------------------------
duesRouter.get(
  "/stats/:groupId",
  requireRole("treasurer"),
  async (req, res) => {
    try {
      const stats = await usersCollection.getDuesStats(req.params.groupId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dues stats", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// ----------------------------
// GET PENDING DUES VERIFICATIONS
// ----------------------------
duesRouter.get(
  "/pending/:groupId/:limit",
  requireRole("treasurer"),
  async (req, res) => {
    try {
      const limit = Number.parseInt(req.params.limit, 10);
      const { total, items } = await duesSubmissionsCollection.getPending(
        req.params.groupId,
        Number.isNaN(limit) ? 0 : limit
      );

      const members = await usersCollection.findUsersByIds(
        items.map((s) => s.userId)
      );
      const membersById = new Map(members.map((m) => [String(m._id), m]));

      const pending = items.map((s) => {
        const member = membersById.get(String(s.userId));
        return {
          submissionId: s._id,
          userId: s.userId,
          firstName: member?.firstName ?? null,
          lastName: member?.lastName ?? null,
          email: member?.email ?? null,
          tier: s.tier,
          paymentReference: s.paymentReference,
          submittedAt: s.submittedAt,
        };
      });

      res.json({ total, pending });
    } catch (error) {
      console.error("Error fetching pending dues", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default duesRouter;
