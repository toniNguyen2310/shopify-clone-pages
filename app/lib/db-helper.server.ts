// app/lib/db-helper.server.ts
import {
    getSessionModel,
    getProductModel,
    getOrderModel,
    getCustomerModel,
    type ISession,
    type IProduct,
    type IOrder,
    type ICustomer
} from '../models';

// Database helper với API tương tự Prisma
export const db = {
    session: {
        async create(data: Omit<ISession, '_id' | 'createdAt' | 'updatedAt'>) {
            const Session = await getSessionModel();
            return await Session.create(data);
        },

        async findUnique(where: { id: string }) {
            const Session = await getSessionModel();
            return await Session.findOne({ id: where.id }).lean();
        },

        async findFirst(where: Partial<ISession>) {
            const Session = await getSessionModel();
            return await Session.findOne(where).lean();
        },

        async findMany(where: Partial<ISession> = {}) {
            const Session = await getSessionModel();
            return await Session.find(where).lean();
        },

        async upsert(params: {
            where: { id: string };
            create: Omit<ISession, '_id' | 'createdAt' | 'updatedAt'>;
            update: Partial<Omit<ISession, '_id' | 'createdAt'>>;
        }) {
            const Session = await getSessionModel();
            return await Session.findOneAndUpdate(
                { id: params.where.id },
                { $set: params.update },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            ).lean();
        },

        async update(params: {
            where: { id: string };
            data: Partial<Omit<ISession, '_id' | 'createdAt'>>;
        }) {
            const Session = await getSessionModel();
            return await Session.findOneAndUpdate(
                { id: params.where.id },
                { $set: params.data },
                { new: true, runValidators: true }
            ).lean();
        },

        async delete(where: { id: string }) {
            const Session = await getSessionModel();
            const result = await Session.deleteOne({ id: where.id });
            return result.deletedCount > 0;
        },

        async deleteMany(where: Partial<ISession>) {
            const Session = await getSessionModel();
            const result = await Session.deleteMany(where);
            return result.deletedCount;
        }
    },

    product: {
        async create(data: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>) {
            const Product = await getProductModel();
            return await Product.create(data);
        },

        async findUnique(where: { shopifyId: string; shop: string }) {
            const Product = await getProductModel();
            return await Product.findOne(where).lean();
        },

        async findFirst(where: Partial<IProduct>) {
            const Product = await getProductModel();
            return await Product.findOne(where).lean();
        },

        async findMany(where: Partial<IProduct> = {}, options?: {
            limit?: number;
            skip?: number;
            sort?: any;
        }) {
            const Product = await getProductModel();
            let query = Product.find(where);

            if (options?.sort) query = query.sort(options.sort);
            if (options?.skip) query = query.skip(options.skip);
            if (options?.limit) query = query.limit(options.limit);

            return await query.lean();
        },

        async upsert(params: {
            where: { shopifyId: string; shop: string };
            create: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>;
            update: Partial<Omit<IProduct, '_id' | 'createdAt'>>;
        }) {
            const Product = await getProductModel();
            return await Product.findOneAndUpdate(
                params.where,
                { $set: params.update },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            ).lean();
        },

        async update(params: {
            where: { shopifyId: string; shop: string };
            data: Partial<Omit<IProduct, '_id' | 'createdAt'>>;
        }) {
            const Product = await getProductModel();
            return await Product.findOneAndUpdate(
                params.where,
                { $set: params.data },
                { new: true, runValidators: true }
            ).lean();
        },

        async delete(where: { shopifyId: string; shop: string }) {
            const Product = await getProductModel();
            const result = await Product.deleteOne(where);
            return result.deletedCount > 0;
        },

        async deleteMany(where: Partial<IProduct>) {
            const Product = await getProductModel();
            const result = await Product.deleteMany(where);
            return result.deletedCount;
        },

        async count(where: Partial<IProduct> = {}) {
            const Product = await getProductModel();
            return await Product.countDocuments(where);
        },

        // Thêm một số methods hữu ích
        async findByShop(shop: string, options?: {
            limit?: number;
            skip?: number;
            status?: string;
        }) {
            const where: any = { shop };
            if (options?.status) where.status = options.status;

            return await this.findMany(where, {
                limit: options?.limit,
                skip: options?.skip,
                sort: { createdAt: -1 }
            });
        },

        async searchProducts(shop: string, searchTerm: string) {
            const Product = await getProductModel();
            return await Product.find({
                shop,
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchTerm, 'i')] } }
                ]
            }).lean();
        }
    },

    order: {
        async create(data: Omit<IOrder, '_id' | 'createdAt' | 'updatedAt'>) {
            const Order = await getOrderModel();
            return await Order.create(data);
        },

        async findUnique(where: { shopifyId: string; shop: string }) {
            const Order = await getOrderModel();
            return await Order.findOne(where).lean();
        },

        async findMany(where: Partial<IOrder> = {}, options?: {
            limit?: number;
            skip?: number;
            sort?: any;
        }) {
            const Order = await getOrderModel();
            let query = Order.find(where);

            if (options?.sort) query = query.sort(options.sort);
            if (options?.skip) query = query.skip(options.skip);
            if (options?.limit) query = query.limit(options.limit);

            return await query.lean();
        },

        async upsert(params: {
            where: { shopifyId: string; shop: string };
            create: Omit<IOrder, '_id' | 'createdAt' | 'updatedAt'>;
            update: Partial<Omit<IOrder, '_id' | 'createdAt'>>;
        }) {
            const Order = await getOrderModel();
            return await Order.findOneAndUpdate(
                params.where,
                { $set: params.update },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            ).lean();
        },

        async update(params: {
            where: { shopifyId: string; shop: string };
            data: Partial<Omit<IOrder, '_id' | 'createdAt'>>;
        }) {
            const Order = await getOrderModel();
            return await Order.findOneAndUpdate(
                params.where,
                { $set: params.data },
                { new: true, runValidators: true }
            ).lean();
        },

        async delete(where: { shopifyId: string; shop: string }) {
            const Order = await getOrderModel();
            const result = await Order.deleteOne(where);
            return result.deletedCount > 0;
        },

        async deleteMany(where: Partial<IOrder>) {
            const Order = await getOrderModel();
            const result = await Order.deleteMany(where);
            return result.deletedCount;
        }
    },

    customer: {
        async create(data: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>) {
            const Customer = await getCustomerModel();
            return await Customer.create(data);
        },

        async findUnique(where: { shopifyId: string; shop: string }) {
            const Customer = await getCustomerModel();
            return await Customer.findOne(where).lean();
        },

        async findMany(where: Partial<ICustomer> = {}) {
            const Customer = await getCustomerModel();
            return await Customer.find(where).lean();
        },

        async upsert(params: {
            where: { shopifyId: string; shop: string };
            create: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>;
            update: Partial<Omit<ICustomer, '_id' | 'createdAt'>>;
        }) {
            const Customer = await getCustomerModel();
            return await Customer.findOneAndUpdate(
                params.where,
                { $set: params.update },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            ).lean();
        },

        async delete(where: { shopifyId: string; shop: string }) {
            const Customer = await getCustomerModel();
            const result = await Customer.deleteOne(where);
            return result.deletedCount > 0;
        },

        async deleteMany(where: Partial<ICustomer>) {
            const Customer = await getCustomerModel();
            const result = await Customer.deleteMany(where);
            return result.deletedCount;
        }
    }
};