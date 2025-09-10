import {
  Box,
  Card,
  Page,
  DataTable,
  Frame,
  Layout,
  Loading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { connectDb } from "app/db.server";
import { authenticate } from "app/shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useNavigationSkeleton } from "app/lib/utils/useNavigationSkeleton";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  await connectDb();

  //get list product
  const response = await admin.graphql(`
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            status
            variants(first: 5) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }
  `);

  const data = await response.json();
  const products = data.data.products.edges.map(({ node }: any) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    status: node.status,
    price: node.variants.edges[0]?.node.price || "N/A",
  }))

  return new Response(
    JSON.stringify({
      currentShop: session.shop,
      session,
      products,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );


};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return null
};

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();
  const rows = products.map((p: any) => [
    p.title,
    p.handle,
    p.status,
    p.price,
  ]);
  const skeleton = useNavigationSkeleton();
  if (skeleton) return skeleton;

  return (
    <Frame>
      <Page>
        <TitleBar title="Products Demo" />
        <Layout>
          <Layout.Section>
            <Card>
              <DataTable
                columnContentTypes={["text", "text", "text", "text"]}
                headings={["Title", "Handle", "Status", "Price"]}
                rows={rows}
                hasZebraStripingOnData
              />
            </Card>
          </Layout.Section>
        </Layout>

      </Page>
    </Frame>

  );
}


