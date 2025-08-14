import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import shopify from "../shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        // Lấy session từ request
        const session = await shopify.authenticateRequest(request);

        // Tạo admin client từ session
        const admin = shopify.api.rest.admin({ session });

        // Ví dụ: lấy 5 products
        const products = await admin.product.list({ limit: 5 });

        return json({
            message: "Session & admin ready",
            shop: session.shop,
            products,
        });
    } catch (error) {
        return json({
            message: "Not authenticated",
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
