import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// REVIEW: leftover from before the project was renamed to ClubSync? Worth
// updating to match (or a comment noting it's intentional to avoid a DB
// migration), since the name shows up in package.json too.
export const DB_NAME = "group-sync";
dotenv.config();
const DEFAULT_URI = process.env.MONGO_URI;
export const CLIENT = new MongoClient(DEFAULT_URI);
await CLIENT.connect();
export const connect = (collectionName) => {
  return CLIENT.db(DB_NAME).collection(collectionName);
};
