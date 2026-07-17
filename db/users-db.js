import { connect } from "./config.js";
import bcrypt from "bcrypt";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

const DUES_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied",
};

function UsersCollection({ collectionName = "users" } = {}) {
  const me = {};

  const users = connect(collectionName);

  // will reject duplicates with the same email, returns a clean
  // object (never the passwordHash) on success, or null if the email is already taken.
  me.registerUser = async ({ email, password, firstName, lastName }) => {
    try {
      const existingUser = await me.findUserByEmail(email);
      if (existingUser) {
        return null;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserDoc = {
        email,
        passwordHash,
        firstName,
        lastName,
        duesStatus: DUES_STATUS.NOT_SUBMITTED,
        groupId: null,
        duesTier: "null",
        role: "member",
        createdAt: new Date(),
      };
      const result = await users.insertOne(newUserDoc);
      console.log("Registered new User in MongoDB 📝");
      return { id: result.insertedId, email, firstName, lastName };
    } catch (error) {
      console.error("Error registering new User", error);
      throw error;
    }
  };

  // atomically sets user duesState to pending for the chosen tier.
  // acts as a guard: returns null if the user is already pending/approved.
  me.submitDues = async (userId, duesTier) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        {
          _id: new ObjectId(userId),
          duesStatus: { $in: [DUES_STATUS.NOT_SUBMITTED, DUES_STATUS.DENIED] },
        },
        {
          $set: {
            duesStatus: DUES_STATUS.PENDING,
            duesTier: duesTier,
          },
        },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error submitting dues User", error);
      throw error;
    }
  };

  // Rolls a group's roster into a new semester. Staff (treasurer/admin) carry
  // over to the new group so they keep running the club, while members are
  // detached and must join with the new code. Everyone's dues reset to
  // not_submitted for the fresh term.
  me.rolloverGroupMembers = async (previousGroupId, newGroupId) => {
    try {
      const previousFilter = ObjectId.isValid(previousGroupId)
        ? new ObjectId(previousGroupId)
        : previousGroupId;
      const nextGroupId = ObjectId.isValid(newGroupId)
        ? new ObjectId(newGroupId)
        : newGroupId;

      // staff stay attached to run the new semester.
      const staff = await users.updateMany(
        { groupId: previousFilter, role: { $in: ["treasurer", "admin"] } },
        {
          $set: {
            groupId: nextGroupId,
            duesStatus: DUES_STATUS.NOT_SUBMITTED,
            duesTier: "null",
          },
        }
      );

      // members drop off; they re-join the new semester with the new code.
      const members = await users.updateMany(
        { groupId: previousFilter, role: "member" },
        {
          $set: {
            groupId: null,
            duesStatus: DUES_STATUS.NOT_SUBMITTED,
            duesTier: "null",
          },
        }
      );

      return {
        staffCarried: staff.modifiedCount,
        membersDetached: members.modifiedCount,
      };
    } catch (error) {
      console.error("Error rolling over group members", error);
      throw error;
    }
  };

  // edit operation on a user document in the users collection that will update the groupId field
  // so that the user is tied to a club/group and is allowed to view a dashboard
  me.joinClub = async (userId, groupId) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { groupId } },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error trying to join the group via code", error);
      throw error;
    }
  };

  // read operation that will get all the memebers within a group that have paid dues, selected a tier,
  // and have had their dues submission for approved.
  me.getDuesStats = async (groupId) => {
    try {
      const groupFilter = groupId
        ? ObjectId.isValid(groupId)
          ? new ObjectId(groupId)
          : groupId
        : { $ne: null };
      const memberCount = await users.countDocuments({ groupId: groupFilter });

      const rows = await users
        .aggregate([
          {
            $match: {
              groupId: groupFilter,
              duesTier: { $in: ["gold", "silver"] },
              duesStatus: "approved",
            },
          },
          { $group: { _id: "$duesTier", count: { $sum: 1 } } },
        ])
        .toArray();

      const gold = rows.find((r) => r._id === "gold")?.count ?? 0;
      const silver = rows.find((r) => r._id === "silver")?.count ?? 0;
      return { gold, silver, total: gold + silver, memberCount };
    } catch (error) {
      console.error("Error fetching dues stats", error);
      throw error;
    }
  };

  // returns the full user document (including passwordHash) or null.
  me.findUserByEmail = async (email) => {
    try {
      return await users.findOne({ email });
    } catch (error) {
      console.error("Error finding user by email", error);
      throw error;
    }
  };

  // find a user in the collection via an id that is stored within the session state
  me.findUserById = async (id) => {
    try {
      if (!ObjectId.isValid(id)) return null;
      return await users.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error finding user by id", error);
      throw error;
    }
  };

  // accepts user IDs and returns lean identity documents.
  // allows routes to populate user details on submissions/RSVPs in a single query.
  me.findUsersByIds = async (ids = []) => {
    try {
      const objectIds = ids
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));
      if (objectIds.length === 0) return [];
      return await users
        .find(
          { _id: { $in: objectIds } },
          {
            projection: {
              firstName: 1,
              lastName: 1,
              email: 1,
              duesTier: 1,
            },
          }
        )
        .toArray();
    } catch (error) {
      console.error("Error finding users by ids", error);
      throw error;
    }
  };

  // mirrors a treasurers dues decision onto the member's own document so the
  // member dashboard reflects approved/denied. A denied member may resubmit and
  // Only moves a member who is still PENDING.
  me.setDuesStatus = async (userId, duesStatus) => {
    try {
      if (!ObjectId.isValid(userId)) return null;
      const updated = await users.findOneAndUpdate(
        { _id: new ObjectId(userId), duesStatus: DUES_STATUS.PENDING },
        { $set: { duesStatus } },
        { returnDocument: "after" }
      );
      return updated;
    } catch (error) {
      console.error("Error setting dues status", error);
      throw error;
    }
  };

  return me;
}

const usersCollection = UsersCollection();
export default usersCollection;
