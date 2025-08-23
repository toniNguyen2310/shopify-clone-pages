// components/TemplateVisibilitySection/index.tsx
import {
    BlockStack,
    Card,
    ChoiceList,
    Icon,
    InlineStack,
    Link,
    Select,
    Text
} from "@shopify/polaris";
import { CalendarTimeIcon, ViewIcon } from "@shopify/polaris-icons";
import type { TemplateVisibilitySectionProps } from "./Types";

export default function TemplateVisibilitySection({
    template,
    visibility,
    onChangeTemplate,
    onChangeVisibility,
    disabled
}: TemplateVisibilitySectionProps) {
    const templateOptions = [
        { label: 'Default page', value: 'default' },
        { label: 'Contact', value: 'contact' },
    ];

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
                            choices={[
                                { label: 'Visible', value: 'Visible' },
                                { label: 'Hidden', value: 'Hidden' },
                            ]}
                            selected={visibility}
                            onChange={onChangeVisibility}
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
                        <Link target="_blank" removeUnderline>
                            <Icon source={ViewIcon} tone="base" />
                        </Link>
                    </InlineStack>
                    <Select
                        label="Template"
                        labelHidden
                        options={templateOptions}
                        onChange={onChangeTemplate}
                        value={template}
                        disabled={disabled}
                    />
                </BlockStack>
            </Card>
        </BlockStack>
    );
}