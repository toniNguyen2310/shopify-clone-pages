import mongoose from "mongoose";

let isConnected = false;

export async function connectDb() {
    if (isConnected) return;

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI as string, {
            dbName: process.env.MONGODB_DB || "shopify_app",
        });
        isConnected = true;
        console.log("✅ MongoDB MODEL connected");
    }
}
