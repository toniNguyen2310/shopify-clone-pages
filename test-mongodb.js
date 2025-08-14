import 'dotenv/config';
import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("❌ Missing MONGODB_URI in environment variables");

async function testConnection() {
    try {
        const client = new MongoClient(mongoUri);
        await client.connect();

        console.log("✅ Connected to MongoDB");

        const dbName = process.env.MONGODB_DB_NAME || "shopify_app";
        const db = client.db(dbName);

        const collections = await db.collections();
        console.log(`📂 Collections in ${dbName}:`, collections.map(c => c.collectionName));

        await client.close();
        console.log("🔌 Connection closed.");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
    }
}

testConnection();
