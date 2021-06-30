import { Db, MongoClient } from "mongodb";

declare module "mongodb" {
  interface Collection<TSchema> {
    findClosest(field: string, value: string, threshold?: number): Promise<TSchema>;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export class Database {
  private static _db: Db;

  static async getDb(): Promise<Db> {
    if (!Database._db) {
      await Database.connect();
    }

    return Database._db;
  }

  static async connect(uri?: string): Promise<void> {
    const _uri = uri ?? process.env.DB_URI;
    if (!_uri) throw new Error("[Database] Database URL not defined, set DB_URI in environment variables");

    const client = new MongoClient(_uri);
    await client.connect();
    Database._db = client.db("professor-kauri-v4");

    const coll = Database._db.collection("test");
  }
}
