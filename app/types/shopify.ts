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

export interface PageFormValues {
    id?: string,
    title: string,
    handle: string,
    body: string,
    templateSuffix: string | null,
    seoTitle: string | null;
    seoDescription: string | null;
    publishedAt: string | null;
    isPublished: boolean;
}

export interface PageTableValue extends Record<string, unknown> {
    id: string,
    title: string,
    body: string,
    publishedAt: string | null;
    isPublished: boolean;
    templateSuffix: string | null,
    updatedAt: string
}

export interface PageTableProps {
    listPages: PageTableValue[]
    setToast: (content: string) => void
}

export type PageFormProps = {
    mode: "create" | "edit";
    defaultValues?: Partial<PageFormValues>;
    onSubmit: (formData: PageFormValues) => void;
    onDelete?: () => void;
    onDuplicate?: (title: string) => void;
    isLoading?: boolean;
    isDeleting?: boolean;
    isDuplicating?: boolean;
    shopDomain?: string
};

export interface PageData {
    title: string;
    handle: string;
    body: string;
    templateSuffix?: string | null;
    publishedAt?: string | null;
    seoTitle?: string;
    seoDescription?: string;
}

export interface PageInput {
    title: string;
    handle: string;
    body: string;
    templateSuffix: string | null;
    isPublished: boolean;
    publishDate: string | null;
    metafields: Array<{
        namespace: string;
        key: string;
        value: string;
        type: string;
    }>;
}