import postgres from "postgres";

// Check environment variables
if (!process.env.DB_URI) {
	throw new Error("Please set the DISCORD_TOKEN environment variable first.");
}

export const pg = postgres(process.env.DB_URI);

// export class Database {
// 	private static _db: Db;

// 	public static async findClosest(
// 		coll: string,
// 		field: string,
// 		value: string,
// 		threshold = 0.33,
// 	): Promise<any | null> {
// 		const database = await this.getDb();
// 		const collection = database.collection(coll);

// 		let list = Database.listCache.get(coll);

// 		if (!list || list.lastFetched < DateTime.now().minus({ days: 1 })) {
// 			const query = { [field]: { $not: { $eq: null } } };

// 			const values = await collection.find(query)
// 				.sort({ _id: 1 })
// 				.project({
// 					_id: 1,
// 					[field]: 1,
// 				})
// 				.toArray();

// 			if (!values.length) {
// 				return null;
// 			}

// 			list = {
// 				data: values,
// 				lastFetched: DateTime.now(),
// 			};

// 			Database.listCache.set(coll, list);
// 		}

// 		const closest = findBestMatch(value.toLowerCase(), list.data.map((x: any) => x[field]?.toLowerCase()));

// 		if (closest.bestMatch.rating < threshold) {
// 			return null;
// 		}

// 		const data = await collection.findOne({ _id: list.data[closest.bestMatchIndex]._id });
// 		if (!data) {
// 			return null;
// 		}

// 		data.matchRating = closest.bestMatch.rating;
// 		return data;
// 	}
// }

