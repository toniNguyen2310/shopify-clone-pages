import mongoose, { Document, Model } from "mongoose";

// Interface session (không dùng 'id' nữa)
export interface ShopifySession {
    shop: string;
    accessToken: string;
    state?: string;
    isOnline?: boolean;
    scope?: string;
}

// Mongoose Document type
export interface ShopifySessionDocument extends ShopifySession, Document { }

// Schema
const SessionSchema = new mongoose.Schema<ShopifySessionDocument>({
    shop: { type: String, required: true },
    accessToken: { type: String, required: true },
    state: { type: String },
    isOnline: { type: Boolean },
    scope: { type: String },
});

// Model
const SessionModel: Model<ShopifySessionDocument> =
    mongoose.models.ShopifySession ||
    mongoose.model<ShopifySessionDocument>("ShopifySession", SessionSchema, "shopify_sessions");

// Hàm lấy session
export async function getSessionByShop(shop: string): Promise<ShopifySession | null> {
    const session = await SessionModel.findOne({ shop }).lean<ShopifySession>().exec();
    return session ?? null;
}
