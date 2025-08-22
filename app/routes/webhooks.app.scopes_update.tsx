import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, sessionStorageExport } from "../shopify.server";

//SAI LOGIC -> cần update lại session sao với trên template remix app
export const action = async ({ request }: ActionFunctionArgs) => {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(`🪝 Received ${topic} webhook for shop: ${shop}`);

    // Xoá toàn bộ session cũ để ép shop re-auth với scope mới
    const sessions = await sessionStorageExport.findSessionsByShop(shop);
    if (sessions.length > 0) {
        await sessionStorageExport.deleteSessions(
            sessions.map((s) => s.id)
        );
        console.log(`🗑️ Deleted ${sessions.length} sessions for shop: ${shop}`);
    } else {
        console.log(`⚠️ No sessions found for shop: ${shop}`);
    }

    return new Response();
};
