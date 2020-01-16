import mongoose from "mongoose";
import { MongooseOptions } from "./constants";

mongoose.set("useCreateIndex", true);

mongoose.connect(`${process.env.KAURIDB_URI!}/monbrey-urpg-v2`, MongooseOptions);

export const db = mongoose.connection;
export const instanceDB = mongoose.createConnection(`${process.env.KAURIDB_URI!}/${process.env.NODE_ENV || "development"}`, MongooseOptions);
