import "@shopify/shopify-app-remix/adapters/node";
import {
    ApiVersion,
    AppDistribution,
    DeliveryMethod,
    shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import dotenv from "dotenv";

dotenv.config();

const sessionStorage = new MongoDBSessionStorage(
    new URL(process.env.MONGODB_URI as string),
    process.env.MONGODB_DB || "shopify_app",
);



const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.January25,
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage, //  MongoDB
    distribution: AppDistribution.AppStore,
    future: {
        unstable_newEmbeddedAuthStrategy: true,
        removeRest: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
        : {}),
    webhooks: {
        APP_UNINSTALLED: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: "/webhooks/app/uninstalled",
        },
        APP_SCOPES_UPDATE: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: "/webhooks/app/scopes_update",
        },
    },
    hooks: {
        afterAuth: async ({ session }) => {
            const webhookResponse = await shopify.registerWebhooks({ session });
            console.log('webhookResponse>>> ', webhookResponse)
        },
    },
});

export default shopify;

// Các export helper giống template gốc
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorageExport = shopify.sessionStorage;
