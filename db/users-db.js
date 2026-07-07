import { connect } from "./config.js";
import bcrypt from "bcrypt";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

function UsersCollection({ collectionName = "users" } = {}) {
  const me = {};

  const users = connect(collectionName);

  // will reject duplicates with the same email, returns a clean 
  // object (never the passwordHash) on success, or null if the email is already taken. 
  me.registerUser = async ({ email, password, name }) => {
    try {
      const existingUser = await me.findUserByEmail(email);
      if (existingUser) {
        return null;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserDoc = {
        email,
        passwordHash,
        name,
        createdAt: new Date(),
      };
      const result = await users.insertOne(newUserDoc);
      console.log("Registered new User in MongoDB 📝");
      return { id: result.insertedId, email, name };
    } catch (error) {
      console.error("Error registering new User", error);
      throw error;
    }
  };

  // Returns the full user document (including passwordHash) or null.
  // The hash is needed by passport to compare passwords, so we don't strip it here, we strip it before we send to the client
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

  // get all users that are stored within the users collection
  me.getAllUsers = async () => {
    try {
      return await users.find({}).toArray();
    } catch (error) {
      console.error("Error fetching all users", error);
      throw error;
    }
  };

  return me;
}

const usersCollection = UsersCollection();
export default usersCollection;
