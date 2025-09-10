// components/TemplateVisibilitySection/index.tsx
import {
    BlockStack,
    Button,
    Card,
    ChoiceList,
    Icon,
    InlineStack,
    Link,
    Select,
    Text,
    TextField
} from "@shopify/polaris";
import { CalendarTimeIcon, ViewIcon } from "@shopify/polaris-icons";
import type { TemplateVisibilitySectionProps } from "./types";

export default function TemplateVisibilitySection({
    templateSuffix,
    publishedAt,
    onChangeTemplateSuffix,
    onChangePublishedAt,
    onChangeIsPublished,
    disabled = false,
}: TemplateVisibilitySectionProps) {
    const isPublished = publishedAt !== null;
    // const isLive = publishedAt && new Date(publishedAt) <= new Date();
    const templateOptions = [
        { label: 'Default', value: '' },
        { label: 'Contact', value: 'contact' },
    ];

    // Format date for display
    const formatPublishDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Visibility choices
    const visibilityChoices = [
        {
            label: 'Visible',
            value: 'visible',
            helpText: isPublished ? `As of ${formatPublishDate(publishedAt)} ` : undefined
        },
        {
            label: 'Hidden',
            value: 'hidden',
            helpText: ''
        },
    ];

    // Handle visibility change
    const handleVisibilityChange = (selected: string[]) => {
        const value = selected[0];
        if (value === 'visible') {
            onChangeIsPublished(true)
            onChangePublishedAt(new Date().toISOString());
        } else {
            // Set to null to hide
            onChangePublishedAt(null);
            onChangeIsPublished(false)
        }
    };

    // Handle template change
    const handleTemplateChange = (value: string) => {
        onChangeTemplateSuffix(value || null);
    };


    return (
        <BlockStack gap="500">
            {/* Visibility Card */}
            <Card>
                <BlockStack gap="200">
                    <InlineStack align="space-between">
                        <Text as="h2" variant="headingMd">
                            Visibility
                        </Text>
                        <Link target="_blank" removeUnderline>
                            <Icon source={CalendarTimeIcon} tone="base" />
                        </Link>
                    </InlineStack>
                    <BlockStack gap="200">
                        <ChoiceList
                            title="Visibility"
                            titleHidden
                            choices={visibilityChoices}
                            selected={[isPublished ? 'visible' : 'hidden']}
                            onChange={handleVisibilityChange}
                            disabled={disabled}
                        />
                    </BlockStack>
                </BlockStack>
            </Card>

            {/* Template Card */}
            <Card>
                <BlockStack gap="200">
                    <InlineStack align="space-between">
                        <Text variant="bodyMd" as="p">
                            Template
                        </Text>
                        <Link target="_blank" removeUnderline >
                            <Icon source={ViewIcon} tone="base" />
                        </Link>
                    </InlineStack>
                    <Select
                        label="Template"
                        labelHidden
                        options={templateOptions}
                        onChange={handleTemplateChange}
                        value={templateSuffix || ''}
                        disabled={disabled}
                    />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}