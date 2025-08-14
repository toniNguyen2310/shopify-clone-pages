// app/db.server.ts
import mongoose from 'mongoose';

interface GlobalForMongoose {
    mongoose?: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

const globalForMongoose = globalThis as unknown as GlobalForMongoose;

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = globalForMongoose.mongoose;

if (!cached) {
    cached = globalForMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
        };

        cached!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached!.conn = await cached!.promise;
        console.log('✅ Connected to MongoDB with Mongoose');
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn;
}

// Ensure connection on startup
connectToDatabase().catch(console.error);

export { mongoose };