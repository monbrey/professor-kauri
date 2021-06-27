import { Db, MongoClient } from "mongodb";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DatabaseUtil = {
  async connect(uri?: string): Promise<Db> {
    const _uri = uri ?? process.env.DB_URI;
    if (!_uri) throw new Error("[Database] Database URL not defined, set DB_URI in environment variables");

    const client = new MongoClient(_uri);
    await client.connect();
    return client.db("lilybot");
  },
};
