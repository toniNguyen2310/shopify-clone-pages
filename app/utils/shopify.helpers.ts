
import { PageFormValues, PageInput } from "app/types";

/**
 * Formats page data into the input format required for Shopify GraphQL mutations
 * @param pageData - The page data object containing all page information
 * @returns Formatted page input object ready for GraphQL mutation
 */
export function formatPageInputForCreate(pageData: PageFormValues): PageInput {
    const pageInput: PageInput = {
        title: pageData.title.toString().trim(),
        handle: pageData.handle.toString().trim(),
        body: pageData.body.toString().trim() || '',
        templateSuffix: pageData.templateSuffix || null,
        isPublished: !!pageData.publishedAt,
        publishDate: pageData.publishedAt ?? null,
        metafields: buildSeoMetafields(pageData),
    };
    return pageInput;
}

export function formatPageDataForUpdate(data: any) {
    return {
        title: data.title?.toString().trim() || '',
        handle: data.handle?.toString().trim() || '',
        body: data.body?.toString() || '',
        templateSuffix: data.templateSuffix === '' || data.templateSuffix === 'null' ? null : data.templateSuffix?.toString() || null,
        isPublished: data.isPublished === 'true' ? true : false,
        publishDate: data.publishedAt === 'null' || !data.publishedAt ? null : data.publishedAt.toString(),
    };
}

export function buildSeoMetafields(
    data: { seoTitle?: string | null; seoDescription?: string | null },
    id?: string
) {
    const metafields: any[] = [];
    const seoTitle = data.seoTitle?.toString().trim();
    const seoDescription = data.seoDescription?.toString().trim();

    if (seoTitle) {
        metafields.push({
            namespace: "global",
            key: "title_tag",
            value: seoTitle,
            type: "single_line_text_field",
            ...(id ? { ownerId: id } : {})
        });
    }
    if (seoDescription) {
        metafields.push({
            namespace: "global",
            key: "description_tag",
            value: seoDescription,
            type: "multi_line_text_field",
            ...(id ? { ownerId: id } : {}),
        });
    }

    return metafields;
}

export interface PageUpdateResult {
    success: boolean;
    page?: any;
    error?: string;
    userErrors?: Array<{ field: string; message: string }>;
}

export function validatePageData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (data.title && data.title.length > 255) {
        errors.push('Title must be less than 255 characters');
    }

    if (data.handle && !/^[a-z0-9-_]+$/.test(data.handle)) {
        errors.push('Handle can only contain lowercase letters, numbers, hyphens, and underscores');
    }

    if (data.seoTitle && data.seoTitle.length > 70) {
        errors.push('SEO title should be less than 70 characters for optimal results');
    }

    if (data.seoDescription && data.seoDescription.length > 160) {
        errors.push('SEO description should be less than 160 characters for optimal results');
    }

    return {
        isValid: errors.length === 0,
        errors
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


