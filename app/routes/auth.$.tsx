import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};
