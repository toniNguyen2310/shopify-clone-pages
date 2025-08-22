import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, sessionStorageExport } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(`🪝 Received ${topic} webhook for shop: ${shop}`);

    // Tìm session của shop
    const sessions = await sessionStorageExport.findSessionsByShop(shop);

    if (sessions && sessions.length > 0) {
      await sessionStorageExport.deleteSessions(sessions.map((s) => s.id));
      console.log(`🗑️ Deleted ${sessions.length} sessions for shop: ${shop}`);
    } else {
      console.log(`⚠️ No sessions found for shop: ${shop}`);
    }

    // Shopify yêu cầu response 200 để xác nhận đã nhận webhook
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook APP_UNINSTALLED error:", error);

    // trả về 500 để báo lỗi (Shopify sẽ retry webhook)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
