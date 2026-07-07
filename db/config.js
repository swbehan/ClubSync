import { MongoClient } from "mongodb";
import dotenv from "dotenv";

export const DB_NAME = 'group-sync';
dotenv.config();
const DEFAULT_URI = process.env.MONGO_URI;
export const CLIENT = new MongoClient(DEFAULT_URI);
await CLIENT.connect();
export const connect = (collectionName) => {
  return CLIENT.db(DB_NAME).collection(collectionName);
};
