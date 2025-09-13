import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import {
  Page,
  Button,
  Toast,
  Frame,
  Layout,
  Loading,
  Modal,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { PageTable } from "app/components/PageTable/PageTable";
import { useNavigationSkeleton } from "app/hooks";
import { DELETE_PAGE_MUTATION, GET_PAGES_QUERY, UPDATE_ISPUBLISH_PAGE_MUTION } from "app/graphql";
import { PageEmpty } from "app/components/PageEmpty/PageEmpty";
import FooterHelpPages from "app/components/Footer/FooterHelp";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  // Lấy danh sách page từ Shopify
  const response = await admin.graphql(GET_PAGES_QUERY);
  const data = await response.json();
  const pages = data.data.pages.edges.map((edge: any) => edge.node);

  return new Response(
    JSON.stringify({
      pages: pages,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData()
  const actionType = formData.get('_action') as string
  const ids = formData.getAll('ids[]') as string[];

  try {
    if (!ids || ids.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        action: actionType,
        message: "No page selected",
        errors: ["No page selected"]
      }), { status: 400 });
    }

    let results: any[] = [];
    if (actionType === 'delete') {
      console.log('✅DELETE MANY SELECTION✅')

      for (const id of ids) {
        const response = await admin.graphql(DELETE_PAGE_MUTATION, { variables: { id } });

        const data = await response.json();
        results.push(data);

      }

      return new Response(JSON.stringify({
        success: true,
        action: "delete",
        message: `Đã xoá ${ids.length} page`,
        results
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (actionType === 'visible' || actionType === 'hidden') {
      const publishState = actionType === 'visible';
      console.log('✅UPDATE MANY data>>> ', publishState)
      for (const id of ids) {
        const response = await admin.graphql(UPDATE_ISPUBLISH_PAGE_MUTION, {
          variables: {
            id,
            page: { isPublished: publishState }
          }
        })
        const data = await response.json();
        results.push(data);
      }

      return new Response(JSON.stringify({
        success: true,
        action: publishState ? "visible" : "hidden",
        message: `Đã cập nhật ${ids.length} page`,
        results
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }


  } catch (error) {
    console.error('Error creating page:', error);
    return new Response(
      JSON.stringify({ error: "Failed to create page" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  return null
};


export default function Index() {
  const { pages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ content: string; error?: boolean } | null>(null);
  const skeleton = useNavigationSkeleton();

  if (skeleton) return skeleton;

  const pageProps =
    pages && pages.length !== 0
    && { fullWidth: true }

  return (

    <Frame>
      <Page
        {...pageProps}
        title='Pages'
        primaryAction={pages && pages.length !== 0 && <Button variant="primary" onClick={() => navigate('/pages/new')}> Add page</Button>}
      >
        <Layout>
          <Layout.Section>
            {pages && pages.length === 0
              ? <PageEmpty />
              :
              <PageTable listPages={pages} setToast={(content: string) => setToast({ content })}
              />
            }
          </Layout.Section>
        </Layout>
        <FooterHelpPages />
      </Page>


      {toast && (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={() => setToast(null)}
        />
      )}

    </Frame>

  );
}