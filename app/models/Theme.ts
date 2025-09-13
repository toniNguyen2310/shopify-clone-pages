import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShopTheme extends Document {
    shopDomain: string;
    themeName: string;
    primaryColor: string;
    createdAt: Date;
    updatedAt: Date;
}

const ShopThemeSchema = new Schema<IShopTheme>(
    {
        shopDomain: {
            type: String,
            required: true,
            index: true,
        },
        themeName: {
            type: String,
            required: true,
            trim: true,
        },
        primaryColor: {
            type: String,
            required: true,
            match: /^#([0-9A-F]{6})$/i,
        },
    },
    { timestamps: true }
);

// Ngăn lỗi OverwriteModelError khi hot reload trong Remix
export const ShopTheme: Model<IShopTheme> =
    mongoose.models.ShopTheme || mongoose.model<IShopTheme>("ShopTheme", ShopThemeSchema);
