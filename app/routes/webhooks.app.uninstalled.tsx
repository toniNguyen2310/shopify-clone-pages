import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, sessionStorageExport } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`🪝 Received ${topic} webhook for shop: ${shop}`);

  // Xoá tất cả session liên quan shop này
  const sessions = await sessionStorageExport.findSessionsByShop(shop);
  if (sessions.length > 0) {
    await sessionStorageExport.deleteSessions(
      sessions.map((s) => s.id)
    );
    console.log(`🗑️ Deleted ${sessions.length} sessions for shop: ${shop}`);
  } else {
    console.log(`⚠️ No sessions found for shop: ${shop}`);
  }

  //XOÁ MODEL ???

  return new Response();
};
