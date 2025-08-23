// components/TemplateVisibilitySection/types.ts
export interface TemplateVisibilitySectionProps {
    template: string;
    visibility: string[];
    onChangeTemplate: (value: string) => void;
    onChangeVisibility: (value: string[]) => void;
    disabled?: boolean
}