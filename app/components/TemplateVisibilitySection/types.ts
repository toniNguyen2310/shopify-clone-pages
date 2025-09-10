// components/TemplateVisibilitySection/types.ts
export interface TemplateVisibilitySectionProps {
    /** Template suffix for the page (e.g., 'contact' for page.contact.liquid) */
    templateSuffix: string | null;

    /** ISO string date when page should be published. null = hidden */
    publishedAt: string | null;

    /** Callback when template suffix changes */
    onChangeTemplateSuffix: (value: string | null) => void;

    onChangeIsPublished: (value: boolean) => void;

    /** Callback when published date changes */
    onChangePublishedAt: (value: string | null) => void;

    /** Whether form controls are disabled */
    disabled?: boolean;
}

export type VisibilityStatus = 'visible' | 'hidden' | 'scheduled';

export type TemplateOption = {
    label: string;
    value: string;
    description?: string;
};