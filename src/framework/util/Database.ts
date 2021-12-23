import { DateTime } from "luxon";
import { Db, MongoClient } from "mongodb";
import { findBestMatch } from "string-similarity";

export interface List {
	data: any[];
	lastFetched: DateTime;
}

export class Database {
	private static _db: Db;
	private static listCache: Map<string, List> = new Map();

	public static async getDb(): Promise<Db> {
		if (!Database._db) {
			await Database.connect();
		}

		return Database._db;
	}

	public static async connect(uri?: string): Promise<void> {
		const _uri = uri ?? process.env.DB_URI;
		if (!_uri) throw new Error("[Database] Database URL not defined, set DB_URI in environment variables");

		const client = new MongoClient(_uri);
		await client.connect();
		Database._db = client.db("professor-kauri-v4");
	}

	public static async findClosest(
		coll: string,
		field: string,
		value: string,
		threshold = 0.33
	): Promise<any | null> {
		const database = await this.getDb();
		const collection = database.collection(coll);

		let list = Database.listCache.get(coll);

		if (!list || list.lastFetched < DateTime.now().minus({ days: 1 })) {
			const query = { [field]: { $not: { $eq: null } } };

			const values = await collection.find(query)
				.sort({ _id: 1 })
				.project({ _id: 1, [field]: 1 })
				.toArray();

			if (!values.length) {
				return null;
			}

			list = {
				data: values,
				lastFetched: DateTime.now(),
			};

			Database.listCache.set(coll, list);
		}

		const closest = findBestMatch(value.toLowerCase(), list.data.map((x: any) => x[field]?.toLowerCase()));

		if (closest.bestMatch.rating < threshold) {
			return null;
		}

		const data = await collection.findOne({ _id: list.data[closest.bestMatchIndex]._id });
		if (!data) {
			return null;
		}

		data.matchRating = closest.bestMatch.rating;
		return data;
	}
}

