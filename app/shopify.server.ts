// app/shopify.server.ts
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import { Session } from "@shopify/shopify-api";
import { db } from "./lib/db-helper.server";

// Mongoose Session Storage (thay thế PrismaSessionStorage)
class MongooseSessionStorage {
    async storeSession(session: Session): Promise<boolean> {
        if (!session.accessToken) {
            throw new Error("Session missing accessToken");
        }
        try {
            await db.session.upsert({
                where: { id: session.id },
                create: {
                    id: session.id,
                    shop: session.shop,
                    state: session.state,
                    isOnline: session.isOnline,
                    scope: session.scope,
                    expires: session.expires,
                    accessToken: session.accessToken,
                },
                update: {
                    shop: session.shop,
                    state: session.state,
                    isOnline: session.isOnline,
                    scope: session.scope,
                    expires: session.expires,
                    accessToken: session.accessToken,
                },
            });
            return true;
        } catch (error) {
            console.error('Error storing session:', error);
            return false;
        }
    }

    async loadSession(id: string): Promise<Session | undefined> {
        try {
            const sessionDoc = await db.session.findUnique({ id });

            if (!sessionDoc) return undefined;

            return new Session({
                id: sessionDoc.id,
                shop: sessionDoc.shop,
                state: sessionDoc.state,
                isOnline: sessionDoc.isOnline,
                scope: sessionDoc.scope,
                expires: sessionDoc.expires,
                accessToken: sessionDoc.accessToken,
            });
        } catch (error) {
            console.error('Error loading session:', error);
            return undefined;
        }
    }

    async deleteSession(id: string): Promise<boolean> {
        try {
            return await db.session.delete({ id });
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }

    async deleteSessions(ids: string[]): Promise<boolean> {
        try {
            let allDeleted = true;
            for (const id of ids) {
                const deleted = await this.deleteSession(id);
                if (!deleted) allDeleted = false;
            }
            return allDeleted;
        } catch (error) {
            console.error('Error deleting sessions:', error);
            return false;
        }
    }

    async findSessionsByShop(shop: string): Promise<Session[]> {
        try {
            const sessionDocs = await db.session.findMany({ shop });

            return sessionDocs.map(doc => new Session({
                id: doc.id,
                shop: doc.shop,
                state: doc.state,
                isOnline: doc.isOnline,
                scope: doc.scope,
                expires: doc.expires,
                accessToken: doc.accessToken,
            }));
        } catch (error) {
            console.error('Error finding sessions by shop:', error);
            return [];
        }
    }
}

const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage: new MongooseSessionStorage(), // Thay thế PrismaSessionStorage
    distribution: "AppDistribution.AppStore" as any,
    restResources,
    webhooks: {
        APP_UNINSTALLED: {
            deliveryMethod: "DeliveryMethod.Http" as any,
            callbackUrl: "/webhooks",
        },
        // Thêm các webhooks khác nếu cần
        PRODUCTS_CREATE: {
            deliveryMethod: "DeliveryMethod.Http" as any,
            callbackUrl: "/webhooks",
        },
        PRODUCTS_UPDATE: {
            deliveryMethod: "DeliveryMethod.Http" as any,
            callbackUrl: "/webhooks",
        },
        ORDERS_PAID: {
            deliveryMethod: "DeliveryMethod.Http" as any,
            callbackUrl: "/webhooks",
        },
    },
    hooks: {
        afterAuth: async ({ session }) => {
            console.log(`✅ App installed/authenticated: ${session.shop}`);

            // Có thể thêm logic setup initial data
            // await setupInitialData(session);
        },
    },
    future: {
        v3_webhookAdminContext: true,
        v3_authenticatePublic: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
        : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
