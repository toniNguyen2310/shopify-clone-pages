import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { useLoaderData, useFetcher } from "@remix-run/react";
import PageForm from "app/components/PageForm/PageForm";
import { useCallback } from "react";
import { Frame, } from "@shopify/polaris";
import { CREATE_PAGE_MUTATION, DELETE_PAGE_MUTATION, GET_PAGE_QUERY, SET_METAFIELDS_MUTATION, UPDATE_PAGE_MUTION } from "app/graphql";
import { useNavigationSkeleton } from "app/hooks/useNavigationSkeleton";
import { generateHandle, ShopifyPageId } from "app/utils/helpers";
import { buildSeoMetafields, formatPageDataForUpdate, formatPageInputForCreate } from "app/utils/shopify.helpers";
import { PageFormValues } from "app/types";

export async function loader({ params, request }: LoaderFunctionArgs) {
    console.log('=== EDIT PAGE LOADER CALLED ===');
    try {
        const { admin, session } = await authenticate.admin(request);
        const paramId = decodeURIComponent(params.id!);
        const id = ShopifyPageId.build(paramId as string)

        const response = await admin.graphql(GET_PAGE_QUERY, { variables: { id } });
        const data = await response.json();
        const page = data?.data?.page;

        const formattedPage = {
            ...page,
            seoTitle: page.seoTitle?.value ?? "",
            seoDescription: page.seoDescription?.value ?? "",
        };

        return new Response(
            JSON.stringify({
                page: formattedPage,
                session: session,
                admin: admin
            }),
            {
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error('❌ Error loading page:', error);
        throw new Response("Internal server error", { status: 500 });
    };
}

export async function action({ params, request }: ActionFunctionArgs) {
    const { admin } = await authenticate.admin(request);
    const paramId = decodeURIComponent(params.id!);
    const id = ShopifyPageId.build(paramId as string)

    const formData = await request.formData();
    const data = Object.fromEntries(formData) as any;

    try {
        if (data._action === "delete") {
            console.log('✅ DELETE PAGE ACTION ✅ ');
            const response = await admin.graphql(DELETE_PAGE_MUTATION, { variables: { id } });
            const result = await response.json();
            if (result.data.pageDelete.userErrors?.length) {
                return { success: false, errors: result.data.pageDelete.userErrors };
            }
            return redirect(`/pages`);
        } else if (data._action === "duplicate") {
            console.log("✅ DUPLICATE PAGE ACTION ✅");
            const originalPage = JSON.parse(data._pageJson);
            const pageInput = formatPageInputForCreate(originalPage)
            console.log('pageInput', pageInput);

            const response = await admin.graphql(CREATE_PAGE_MUTATION, { variables: { page: pageInput } });
            const result = await response.json();
            const pageId = result.data.pageCreate.page.id
            const extractedId = ShopifyPageId.extract(pageId);

            return redirect(`/pages/${encodeURIComponent(extractedId as string)}`);

        } else {
            console.log('✅UPDATE PAGE ACTION ✅');
            const pageInput = formatPageDataForUpdate(data);
            console.log('pageInput', pageInput);

            const updateResponse = await admin.graphql(UPDATE_PAGE_MUTION, {
                variables: {
                    id: id,
                    page: pageInput
                }
            });
            const updateResult = await updateResponse.json();
            console.log('Update result:', JSON.stringify(updateResult, null, 2));

            if (updateResult.data?.pageUpdate?.userErrors?.length > 0) {
                console.error('Page update errors:', updateResult.data.pageUpdate.userErrors);
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'Page update failed',
                        userErrors: updateResult.data.pageUpdate.userErrors
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    }
                );
            }

            // Update SEO metafields if provided
            const metafieldsToUpdate = buildSeoMetafields(data, id);
            console.log('metafieldsToUpdate>> ', metafieldsToUpdate)
            if (metafieldsToUpdate.length > 0) {
                console.log('Updating SEO metafields...');
                const metafieldResponse = await admin.graphql(SET_METAFIELDS_MUTATION, {
                    variables: {
                        metafields: metafieldsToUpdate
                    }
                });

                const metafieldResult = await metafieldResponse.json();
                console.log('Metafield result:', JSON.stringify(metafieldResult, null, 2));

                if (metafieldResult.data?.metafieldsSet?.userErrors?.length > 0) {
                    console.error('Metafield update errors:', metafieldResult.data.metafieldsSet.userErrors);
                }
            }

            console.log('✅ Page updated successfully');

            // Return success response
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Page updated successfully',
                    page: updateResult.data.pageUpdate.page
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }
    } catch (error) {
        console.error('Error creating page:', error);
        return new Response(
            JSON.stringify({ error: "Failed to create page" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export default function EditPage() {
    const { page, session } = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof action>();
    const isSubmitting = fetcher.state === "submitting";

    const handleSubmit = useCallback((formData: PageFormValues) => {
        const submitData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                submitData.append(key, String(value));
            }
        });
        fetcher.submit(submitData, { method: "post" });
    }, [fetcher]);

    // Delete
    const handleDelete = useCallback(() => {
        if (!page.id) return;
        const fd = new FormData();
        fd.append("_action", "delete");
        fetcher.submit(fd, { method: "post" });
    }, [page.id, fetcher]);

    // Duplicate
    const handleDuplicate = useCallback((title: string) => {
        const baseHandle = generateHandle(title)
        const newHandle = `${baseHandle}-${Date.now()}`

        const pageDuplicate = { ...page, id: undefined, title, handle: newHandle }
        const fd = new FormData();
        fd.append("_action", "duplicate");
        fd.append("_pageJson", JSON.stringify(pageDuplicate));
        fetcher.submit(fd, { method: "post" });
    }, [page, fetcher]);

    const skeleton = useNavigationSkeleton();
    if (skeleton) return skeleton;

    return (
        <>
            <Frame>
                <PageForm
                    mode="edit"
                    defaultValues={page}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    isLoading={isSubmitting}
                    shopDomain={session.shop}
                />
            </Frame>
        </>
    );
}

