import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import {
  Page,
  Button,
  Toast,
  Frame,
  Layout,
  Loading,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { PageTable } from "app/components/PageTable/PageTable";
import { useNavigationSkeleton } from "app/lib/utils/useNavigationSkeleton";
import { DELETE_PAGE_MUTATION } from "app/lib/shopify/graphql";
import { PageEmpty } from "app/components/PageEmpty/PageEmpty";
import FooterHelpPages from "app/components/Footer/FooterHelp";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  // Lấy danh sách page từ Shopify
  const response = await admin.graphql(`
    {
      pages(first: 20) {
        edges {
          node {
            id
            title
            body
            isPublished
            updatedAt
            templateSuffix
          }
        }
      }
    }
  `);
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
      return new Response(JSON.stringify({ error: "No page selected" }), { status: 400 });
    }

    let results: any[] = [];
    if (actionType === 'delete') {
      console.log('✅DELETE MANY SELECTION✅')
      console.log('DELETE MANY data>>> ', ids)

      for (const id of ids) {
        const response = await admin.graphql(DELETE_PAGE_MUTATION, { variables: { id } });

        const data = await response.json();
        results.push(data);

      }
      console.log('deleted:', results);

      return new Response(JSON.stringify({ ok: true, results }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (actionType === 'setVisible' || actionType === 'setHidden') {
      const publishState = actionType === 'setVisible';
      console.log('✅UPDATE MANY data>>> ', publishState)
      for (const id of ids) {
        console.log('UPDATE MANY SELECTION✅')
        let UPDATE_ISPUBLISH_PAGE_MUTION = `
            mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        id
                        title
                        isPublished    
                    }
                    userErrors {
                        code
                        field
                        message
                    }
                }
            }
        `;
        const response = await admin.graphql(UPDATE_ISPUBLISH_PAGE_MUTION, {
          variables: {
            id,
            page: { isPublished: publishState }
          }
        })
        const data = await response.json();
        results.push(data);
      }
      console.log('update:', results);

      return new Response(JSON.stringify({ ok: true, results }), {
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
  const navigation = useNavigation();
  const [toast, setToast] = useState<{ content: string; error?: boolean } | null>(null);
  const skeleton = useNavigationSkeleton();

  useEffect(() => {
    console.log('pages>> ', pages)
  }, [pages])

  if (skeleton) return skeleton;

  const pageProps =
    pages && pages.length !== 0
    && { fullWidth: true }

  return (
    <Frame>
      {navigation.state === 'loading' && <Loading />}

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
              <PageTable listPages={pages} />

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