import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { connectDb } from "app/db.server";
import { PageModel } from "app/models/Page";
import { useFetcher, useNavigation, useSubmit } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import PageForm from "app/components/PageForm/PageForm";
import { PageFormValues } from "app/lib/shopify/types/pages";
import { Frame, Loading } from "@shopify/polaris";
import { PageSkeleton } from "app/components/Skeletons/PageSkeleton";
import { useNavigationSkeleton } from "app/lib/utils/useNavigationSkeleton";
import { ShopifyPageId } from "app/lib/utils/useShopifyPageId ";

const CREATE_PAGE_MUTATION = `
    mutation pageCreate($page: PageCreateInput!) {
    pageCreate(page: $page) {
    page {
      id
      title
      handle
        metafields(first: 10) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
    }
    userErrors {
      field
      message
    }
  }
}
`



export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return null;
};

export async function action({ request }: ActionFunctionArgs) {
    try {
        const { admin } = await authenticate.admin(request);

        const formData = await request.formData();
        const pageData = Object.fromEntries(formData) as unknown as PageFormValues;
        console.log('pageData>> ', pageData)
        const pageInput = {
            title: pageData.title,
            handle: pageData.handle,
            body: pageData.body,
            templateSuffix: pageData.templateSuffix || null,
            isPublished: !!pageData.publishedAt,
            publishDate: pageData.publishedAt ?? null,
            metafields: [] as any[],
        };
        console.log('pageInput>> ', pageInput)
        if (pageData.seoTitle) {
            pageInput.metafields.push({
                namespace: "global",
                key: "title_tag",
                value: pageData.seoTitle.toString().trim(),
                type: "single_line_text_field",
            });
        }
        if (pageData.seoDescription) {
            pageInput.metafields.push({
                namespace: "global",
                key: "description_tag",
                value: pageData.seoDescription.toString().trim(),
                type: "multi_line_text_field",
            });
        }
        console.log('pageInput>> ', pageInput)
        const response = await admin.graphql(CREATE_PAGE_MUTATION, {
            variables: { page: pageInput },
        });

        const result = await response.json();
        console.log("✅ GraphQL response:", result);
        const pageId = result.data.pageCreate.page.id
        console.log('pageId>> ', pageId);
        const extractedId = ShopifyPageId.extract(pageId);
        if (result.data?.pageCreate?.userErrors?.length > 0) {
            console.error("❌ User errors:", result.data.pageCreate.userErrors);
            return new Response(
                JSON.stringify({ errors: result.data.pageCreate.userErrors }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        // return null
        return redirect(`/pages/${encodeURIComponent(extractedId as string)}`);

    } catch (error) {
        console.error('Error creating page:', error);
        return new Response(
            JSON.stringify({ error: "Failed to create page" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export default function AddPage() {
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === "submitting";

    const handleSubmit = useCallback((formData: PageFormValues, e?: React.FormEvent) => {
        e?.preventDefault();
        const submitData = new FormData();

        // Add all fields to form data
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                submitData.append(key, String(value));
            }
        });

        fetcher.submit(submitData, { method: "post" });
    }, [fetcher]);

    const skeleton = useNavigationSkeleton();
    if (skeleton) return skeleton;

    return (
        <Frame>
            <PageForm
                mode="create"
                onSubmit={(value) => handleSubmit(value)}
                isLoading={isSubmitting}
            />
        </Frame>

    );
}