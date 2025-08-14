// app/models/index.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { connectToDatabase } from '../db.server';

// Session Interface & Schema (thay thế Prisma Session model)
export interface ISession extends Document {
    id: string;
    shop: string;
    state: string;
    isOnline: boolean;
    scope?: string;
    expires?: Date;
    accessToken: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
    id: { type: String, required: true, unique: true },
    shop: { type: String, required: true, index: true },
    state: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    scope: { type: String },
    expires: { type: Date, expires: 0 }, // TTL index cho auto cleanup
    accessToken: { type: String, required: true },
    userId: { type: String },
}, {
    timestamps: true, // Tự động thêm createdAt, updatedAt
    collection: 'sessions'
});

// Product Interface & Schema
export interface IProduct extends Document {
    shopifyId: string;
    shop: string;
    title: string;
    handle: string;
    status: string;
    price: string;
    inventory: number;
    description?: string;
    vendor?: string;
    productType?: string;
    tags?: string[];
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    shopifyId: { type: String, required: true },
    shop: { type: String, required: true, index: true },
    title: { type: String, required: true },
    handle: { type: String, required: true },
    status: { type: String, enum: ['active', 'archived', 'draft'], default: 'draft' },
    price: { type: String, default: '0.00' },
    inventory: { type: Number, default: 0 },
    description: { type: String },
    vendor: { type: String },
    productType: { type: String },
    tags: [{ type: String }],
    images: [{ type: String }],
}, {
    timestamps: true,
    collection: 'products'
});

// Compound unique index cho shopifyId + shop
ProductSchema.index({ shopifyId: 1, shop: 1 }, { unique: true });

// Order Interface & Schema
export interface IOrder extends Document {
    shopifyId: string;
    shop: string;
    orderNumber: number;
    email?: string;
    totalPrice: string;
    financialStatus: string;
    fulfillmentStatus?: string;
    customerInfo?: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    lineItems: Array<{
        productId: string;
        variantId: string;
        title: string;
        quantity: number;
        price: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    shopifyId: { type: String, required: true },
    shop: { type: String, required: true, index: true },
    orderNumber: { type: Number, required: true },
    email: { type: String },
    totalPrice: { type: String, required: true },
    financialStatus: {
        type: String,
        enum: ['pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided'],
        required: true
    },
    fulfillmentStatus: {
        type: String,
        enum: ['fulfilled', 'null', 'partial', 'restocked']
    },
    customerInfo: {
        firstName: String,
        lastName: String,
        email: String,
    },
    lineItems: [{
        productId: { type: String, required: true },
        variantId: { type: String, required: true },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: String, required: true },
    }],
}, {
    timestamps: true,
    collection: 'orders'
});

OrderSchema.index({ shopifyId: 1, shop: 1 }, { unique: true });

// Customer Interface & Schema
export interface ICustomer extends Document {
    shopifyId: string;
    shop: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    ordersCount: number;
    totalSpent: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
    shopifyId: { type: String, required: true },
    shop: { type: String, required: true, index: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: String, default: '0.00' },
    tags: [{ type: String }],
}, {
    timestamps: true,
    collection: 'customers'
});

CustomerSchema.index({ shopifyId: 1, shop: 1 }, { unique: true });
CustomerSchema.index({ email: 1, shop: 1 });

// Models - sử dụng singleton pattern để tránh re-compile
let SessionModel: Model<ISession>;
let ProductModel: Model<IProduct>;
let OrderModel: Model<IOrder>;
let CustomerModel: Model<ICustomer>;

// Function để khởi tạo models (chỉ chạy sau khi connect)
export async function getModels() {
    await connectToDatabase();

    if (!SessionModel) {
        SessionModel = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
    }
    if (!ProductModel) {
        ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
    }
    if (!OrderModel) {
        OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
    }
    if (!CustomerModel) {
        CustomerModel = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
    }

    return {
        Session: SessionModel,
        Product: ProductModel,
        Order: OrderModel,
        Customer: CustomerModel,
    };
}

// Export individual models
export async function getSessionModel() {
    const { Session } = await getModels();
    return Session;
}

export async function getProductModel() {
    const { Product } = await getModels();
    return Product;
}

export async function getOrderModel() {
    const { Order } = await getModels();
    return Order;
}

export async function getCustomerModel() {
    const { Customer } = await getModels();
    return Customer;
}