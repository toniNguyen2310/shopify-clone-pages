import { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { useLoaderData, useNavigation, useSubmit, useFetcher, Navigate, useNavigate } from "@remix-run/react";
import PageForm from "app/components/PageForm/PageForm";
import { PageFormValues } from "app/lib/shopify/types/pages";
import { formatMetafieldsForUpdate, formatPageDataForGraphQL } from "app/lib/utils/pageUtils";
import { useCallback, useEffect, useState } from "react";
import { ShopifyPageId } from "app/lib/utils/useShopifyPageId ";
import { Frame, } from "@shopify/polaris";
import { useNavigationSkeleton } from "app/lib/utils/useNavigationSkeleton";
import { DELETE_PAGE_MUTATION, generateHandle } from "app/lib/shopify/graphql";

const DUPLICATE_PAGE_MUTATION = `
 mutation pageCreate($page: PageCreateInput!) {
    pageCreate(page: $page) {
    page {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`;

const updatePageMutation = `
            mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        id
                        title
                        body
                        handle
                        isPublished
                        publishedAt
                        templateSuffix
                    }
                    userErrors {
                        code
                        field
                        message
                    }
                }
            }
        `;


export async function loader({ params, request }: LoaderFunctionArgs) {
    console.log('=== EDIT PAGE LOADER CALLED ===');
    try {
        const { admin, session } = await authenticate.admin(request);

        const paramId = decodeURIComponent(params.id!);
        const id = ShopifyPageId.build(paramId as string)

        console.log("[Loader] Page ID:", id);
        const response = await admin.graphql(
            `
                    query getPage($id: ID!) {
                    page(id: $id) {
                        id  
                        title
                        body
                        handle
                        isPublished
                        publishedAt
                        templateSuffix
                        seoTitle: metafield(namespace: "global", key: "title_tag") {
                        value
                        }
                        seoDescription: metafield(namespace: "global", key: "description_tag") {
                        value
                        }              
                    }
                    }
     `,
            { variables: { id } });

        const data = await response.json();
        const page = data?.data?.page;
        console.log('page>>> ', page)
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
            console.log('=== DELETE PAGE ACTION ===');
            // Delete page
            const res = await admin.graphql(DELETE_PAGE_MUTATION, { variables: { id } });
            const result = await res.json();
            if (result.data.pageDelete.userErrors?.length) {
                return { success: false, errors: result.data.pageDelete.userErrors };
            }
            return redirect(`/pages`);
        } else if (data._action === "duplicate") {
            console.log("=== DUPLICATE PAGE ACTION ===");


            // Lấy thông tin page từ FormData (hoặc bạn có thể thêm hidden input chứa full page JSON nếu cần)
            const originalPage = JSON.parse(data._pageJson);

            const newPageInput = {
                title: originalPage.title,
                handle: originalPage.handle,
                body: originalPage.body,
                templateSuffix: originalPage.templateSuffix || null,
                isPublished: !!originalPage.publishedAt,
                publishDate: originalPage.publishedAt ?? null,
                metafields: [] as any[],
            };
            if (originalPage.seoTitle) {
                newPageInput.metafields.push({
                    namespace: "global",
                    key: "title_tag",
                    value: originalPage.seoTitle.toString().trim(),
                    type: "single_line_text_field",
                });
            }
            if (originalPage.seoDescription) {
                newPageInput.metafields.push({
                    namespace: "global",
                    key: "description_tag",
                    value: originalPage.seoDescription.toString().trim(),
                    type: "multi_line_text_field",
                });
            }

            const res = await admin.graphql(DUPLICATE_PAGE_MUTATION, { variables: { page: newPageInput } });
            const result = await res.json();
            const idPageNum = ShopifyPageId.extract(result.data.pageCreate.page.id)
            return redirect(`/pages/${encodeURIComponent(idPageNum as string)}`);

        } else {
            console.log('=== UPDATE PAGE ACTION ===');


            const pageData = formatPageDataForGraphQL(data);
            console.log('Parsed page data:', pageData);

            // GraphQL mutation to update page
            const pageInput = {
                title: pageData.title,
                body: pageData.body,
                handle: pageData.handle,
                templateSuffix: pageData.templateSuffix,
                isPublished: pageData.isPublished,
                publishDate: pageData.publishedAt
                // publishedAt: pageData.publishedAt
            };

            console.log('GraphQL input:', pageInput);

            const updateResponse = await admin.graphql(updatePageMutation, {
                variables: {
                    id: id,
                    page: pageInput
                }
            });
            console.log('run')
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
            const metafieldsToUpdate = formatMetafieldsForUpdate(data, id);

            if (metafieldsToUpdate.length > 0) {
                console.log('Updating SEO metafields...');

                const metafieldMutation = `
                mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                    metafieldsSet(metafields: $metafields) {
                        metafields {
                            id
                            namespace
                            key
                            value
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }
            `;

                const metafieldResponse = await admin.graphql(metafieldMutation, {
                    variables: {
                        metafields: metafieldsToUpdate
                    }
                });

                const metafieldResult = await metafieldResponse.json();
                console.log('Metafield result:', JSON.stringify(metafieldResult, null, 2));

                if (metafieldResult.data?.metafieldsSet?.userErrors?.length > 0) {
                    console.error('Metafield update errors:', metafieldResult.data.metafieldsSet.userErrors);
                    // Log errors but don't fail the entire operation
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
        console.log('formData>> ', formData)

        const submitData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                submitData.append(key, String(value));
            }
        });
        console.log('submitData>> ', submitData)
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

        const newHandle = baseHandle === page.handle ? `${baseHandle}-${Date.now()}` : baseHandle

        const pageDuplicate = {
            ...page,
            id: undefined,
            title,
            handle: newHandle
        }
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

