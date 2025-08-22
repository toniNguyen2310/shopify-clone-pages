import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('❌RUN AUTH BEFORE AUTH')
  const { session, admin } = await authenticate.admin(request);
  console.log('RUN AUTH AFFTER AUTH')

  try {
    const webhookResponse = await registerWebhooks({ session });
    console.log('📡 Webhooks registered for shop:', session.shop, webhookResponse);
  } catch (error) {
    console.error('❌ Webhook registration failed:', error);

  }

  return null;
};
