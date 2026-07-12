import { connect } from "./config.js";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

const SUBMISSION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied",
};

function DuesSubmissionsCollection({
  collectionName = "dues_submissions",
} = {}) {
  const me = {};

  const submissions = connect(collectionName);

  // create a new pending submission. groupId is snapshotted from the user so the
  // treasurer can query the queue by group without joining users.
  me.createSubmission = async ({
    userId,
    groupId,
    tier,
    paymentReference = null,
  }) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const newSubmissionDoc = {
        userId: new ObjectId(userId),
        groupId: ObjectId.isValid(groupId) ? new ObjectId(groupId) : groupId,
        tier,
        paymentReference,
        status: SUBMISSION_STATUS.PENDING,
        reviewNote: null,
        reviewedBy: null,
        submittedAt: new Date(),
        reviewedAt: null,
      };
      const result = await submissions.insertOne(newSubmissionDoc);
      console.log("Created new dues submission in MongoDB 💵");
      return { id: result.insertedId, ...newSubmissionDoc };
    } catch (error) {
      console.error("Error creating dues submission", error);
      throw error;
    }
  };

  // Fetches "pending" Silver/Gold submissions for a group, sorted oldest-first.
  // A limit > 0 caps the subset (e.g., 5 for widgets); limit <= 0 returns all.
  // Returns { total, items } so widgets can display a full pending count badge.
  // Member names are attached downstream via a batched lookup route.
  me.getPending = async (groupId, limit = 0) => {
    try {
      const groupFilter = ObjectId.isValid(groupId)
        ? new ObjectId(groupId)
        : groupId;

      const query = {
        groupId: groupFilter,
        status: SUBMISSION_STATUS.PENDING,
        tier: { $in: ["gold", "silver"] },
      };

      const total = await submissions.countDocuments(query);

      let cursor = submissions.find(query).sort({ submittedAt: 1 });
      if (limit > 0) cursor = cursor.limit(limit);
      const items = await cursor.toArray();

      return { total, items };
    } catch (error) {
      console.error("Error fetching pending dues submissions", error);
      throw error;
    }
  };

  return me;
}

const duesSubmissionsCollection = DuesSubmissionsCollection();
export default duesSubmissionsCollection;
export { SUBMISSION_STATUS };
