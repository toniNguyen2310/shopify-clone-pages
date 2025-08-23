import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPage extends Document {
    title: string;
    content?: string;
    pageTitle?: string;
    metaDescription?: string;
    visibility?: string[];
    template: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
    {
        title: { type: String, required: true },
        content: String,
        pageTitle: String,
        metaDescription: String,
        visibility: [String],
        template: { type: String, default: "default" },
        status: { type: String, default: "active" }
    },
    { timestamps: true }
);

export const PageModel: Model<IPage> =
    mongoose.models.PageModel || mongoose.model<IPage>('PageModel', PageSchema)