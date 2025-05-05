import postgres from "postgres";

// Check environment variables
if (!process.env.DB_URI) {
	throw new Error("Please set the DISCORD_TOKEN environment variable first.");
}

export const pg = postgres(process.env.DB_URI);
