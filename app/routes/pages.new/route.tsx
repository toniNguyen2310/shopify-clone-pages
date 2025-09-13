import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import PageForm from "app/components/PageForm/PageForm";
import { Frame } from "@shopify/polaris";
import { useNavigationSkeleton } from "app/hooks/useNavigationSkeleton";
import { CREATE_PAGE_MUTATION } from "app/graphql";
import { ShopifyPageId } from "app/utils/helpers";
import { formatPageInputForCreate } from "app/utils/shopify.helpers";
import { PageFormValues } from "app/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return null;
};

export async function action({ request }: ActionFunctionArgs) {
    try {
        const { admin } = await authenticate.admin(request);

        const formData = await request.formData();
        const pageData = Object.fromEntries(formData) as unknown as PageFormValues;
        const pageInput = formatPageInputForCreate(pageData)

        const response = await admin.graphql(CREATE_PAGE_MUTATION, {
            variables: { page: pageInput },
        });

        const result = await response.json();
        const pageId = result.data.pageCreate.page.id
        const extractedId = ShopifyPageId.extract(pageId);

        if (result.data?.pageCreate?.userErrors?.length > 0) {
            console.error("❌ User errors:", result.data.pageCreate.userErrors);
            return new Response(
                JSON.stringify({ errors: result.data.pageCreate.userErrors }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
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