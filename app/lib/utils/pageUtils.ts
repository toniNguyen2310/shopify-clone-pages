
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

export function formatPageDataForGraphQL(data: any) {
    return {
        title: data.title?.toString().trim() || '',
        body: data.body?.toString() || '',
        handle: data.handle?.toString().trim() || '',
        templateSuffix: data.templateSuffix === '' || data.templateSuffix === 'null' ? null : data.templateSuffix?.toString() || null,
        isPublished: data.isPublished === 'true' ? true : false,
        publishedAt: data.publishedAt === 'null' || !data.publishedAt ? null : data.publishedAt.toString(),
        seoTitle: data.title?.toString().trim()
    };
}

export function formatMetafieldsForUpdate(data: any, pageId: string) {
    const metafields = [];

    if (data.seoTitle?.toString().trim()) {
        metafields.push({
            namespace: "global",
            key: "title_tag",
            value: data.seoTitle.toString().trim(),
            type: "single_line_text_field",
            ownerId: pageId
        });
    }

    if (data.seoDescription?.toString().trim()) {
        metafields.push({
            namespace: "global",
            key: "description_tag",
            value: data.seoDescription.toString().trim(),
            type: "multi_line_text_field",
            ownerId: pageId
        });
    }

    return metafields;
}