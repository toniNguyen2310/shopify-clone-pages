// app/graphql/pages.ts

// =================== GRAPHQL QUERIES & MUTATIONS ===================

export const GET_PAGES_QUERY = `
    query getPages($first: Int!, $after: String) {
        pages(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
            edges {
                node {
                    id
                    title
                    handle
                    bodySummary
                    isPublished
                    createdAt
                    updatedAt
                    seo {
                        title
                        description
                    }
                    metafields(first: 5, namespace: "custom") {
                        edges {
                            node {
                                key
                                value
                                namespace
                            }
                        }
                    }
                }
                cursor
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`;

export const GET_PAGE_QUERY = `
    query getPage($id: ID!) {
        page(id: $id) {
            id
            title
            body
            handle
            isPublished
            seo {
                title
                description
            }
            metafields(first: 10, namespace: "custom") {
                edges {
                    node {
                        id
                        key
                        value
                        namespace
                        type
                    }
                }
            }
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_PAGE_MUTATION = `
    mutation pageCreate($page: PageInput!) {
        pageCreate(page: $page) {
            page {
                id
                title
                handle
                bodySummary
                createdAt
                updatedAt
                isPublished
                seo {
                    title
                    description
                }
            }
            userErrors {
                field
                message
                code
            }
        }
    }
`;

export const UPDATE_PAGE_MUTATION = `
    mutation pageUpdate($id: ID!, $page: PageInput!) {
        pageUpdate(id: $id, page: $page) {
            page {
                id
                title
                handle
                isPublished
                updatedAt
                seo {
                    title
                    description
                }
            }
            userErrors {
                field
                message
                code
            }
        }
    }
`;

//DONE
export const DELETE_PAGE_MUTATION = `
    mutation pageDelete($id: ID!) {
        pageDelete(id: $id) {
            deletedPageId
            userErrors {
                field
                message
                code
            }
        }
    }
`;

export const SET_METAFIELDS_MUTATION = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
            metafields {
                id
                key
                value
                namespace
                type
            }
            userErrors {
                field
                message
                code
            }
        }
    }
`;

// =================== TYPESCRIPT INTERFACES ===================

export interface PageNode {
    id: string;
    title: string;
    body?: string;
    handle: string;
    bodySummary?: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    seo?: {
        title?: string;
        description?: string;
    };
    metafields?: {
        edges: Array<{
            node: {
                id: string;
                key: string;
                value: string;
                namespace: string;
                type: string;
            };
        }>;
    };
}

export interface PageFormData {
    title: string;
    content: string;
    pageTitle: string;
    metaDescription: string;
    visibility: string[];
    template: string;
}

export interface PageInput {
    title: string;
    body: string;
    isPublished: boolean;
    seo?: {
        title?: string;
        description?: string;
    };
    metafields?: Array<{
        namespace: string;
        key: string;
        value: string;
        type: string;
    }>;
}

// =================== HELPER FUNCTIONS ===================

// Extract page ID từ GraphQL ID (gid://shopify/Page/123 -> 123)
export function extractPageId(gid: string): string {
    return gid.split('/').pop() || '';
}

// Tạo GraphQL ID từ page ID (123 -> gid://shopify/Page/123)
export function createPageGid(id: string): string {
    return `gid://shopify/Page/${id}`;
}

// Chuyển đổi form data thành PageInput cho GraphQL
export function formatPageInput(pageData: PageFormData): PageInput {
    const visibility = Array.isArray(pageData.visibility)
        ? pageData.visibility
        : JSON.parse(pageData.visibility || '["Hidden"]');

    return {
        title: pageData.title,
        body: pageData.content,
        isPublished: !visibility.includes('Hidden'),
        seo: {
            title: pageData.pageTitle || pageData.title,
            description: pageData.metaDescription || ""
        },
        metafields: [
            {
                namespace: "custom",
                key: "template",
                value: pageData.template || "default",
                type: "single_line_text_field"
            }
        ]
    };
}

// Chuyển đổi GraphQL response thành form state
export function formatPageToFormState(page: PageNode): any {
    // Tìm template trong metafields
    const templateMetafield = page.metafields?.edges?.find(
        (edge) => edge.node.key === "template"
    );
    const template = templateMetafield?.node?.value || "default";

    return {
        title: page.title,
        content: page.body || '',
        pageTitle: page.seo?.title || page.title,
        metaDescription: page.seo?.description || "",
        visibility: page.isPublished ? ['Public'] : ['Hidden'],
        template: template
    };
}

// Xử lý GraphQL errors
export function handleGraphQLErrors(result: any, operationName: string): any {
    if (!result.data) {
        throw new Error(`GraphQL request failed for ${operationName}`);
    }

    const operation = result.data[operationName];
    if (!operation) {
        throw new Error(`Operation ${operationName} not found in response`);
    }

    const errors = operation.userErrors;
    if (errors && errors.length > 0) {
        const errorMessages = errors.map((error: any) =>
            `${error.field ? `${error.field}: ` : ''}${error.message}`
        ).join(', ');
        throw new Error(`${operationName} failed: ${errorMessages}`);
    }

    return operation;
}

// Format date cho display
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Generate handle/slug từ title
export function generateHandle(title: string): string {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

// Validate page data
export function validatePageData(pageData: PageFormData): void {
    if (!pageData.title || pageData.title.trim().length === 0) {
        throw new Error("Page title is required");
    }

    if (pageData.title.length > 255) {
        throw new Error("Page title must be 255 characters or less");
    }

    if (pageData.pageTitle && pageData.pageTitle.length > 70) {
        throw new Error("SEO title should be 70 characters or less for optimal display");
    }

    if (pageData.metaDescription && pageData.metaDescription.length > 160) {
        throw new Error("Meta description should be 160 characters or less for optimal display");
    }
}

// Lấy giá trị metafield
export function getMetafieldValue(page: PageNode, key: string): string | null {
    const metafield = page.metafields?.edges?.find(
        (edge) => edge.node.key === key && edge.node.namespace === "custom"
    );
    return metafield?.node?.value || null;
}

// Tạo metafield input
export function createMetafieldInput(ownerId: string, key: string, value: string) {
    return {
        ownerId,
        namespace: "custom",
        key,
        value,
        type: "single_line_text_field"
    };
}

// Format pages cho DataTable
export function formatPagesForTable(pagesEdges: any[]): any[] {
    return pagesEdges.map((edge) => {
        const page = edge.node;
        const pageId = extractPageId(page.id);

        return {
            id: pageId,
            gid: page.id,
            title: page.title,
            handle: page.handle,
            bodySummary: page.bodySummary,
            status: page.isPublished ? 'Published' : 'Draft',
            seoTitle: page.seo?.title,
            seoDescription: page.seo?.description,
            createdAt: formatDate(page.createdAt),
            updatedAt: formatDate(page.updatedAt),
        };
    });
}