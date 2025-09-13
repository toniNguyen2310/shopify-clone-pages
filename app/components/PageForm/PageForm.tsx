import { useCallback, useEffect, useState } from "react";
import {
    Page,
    Layout,
    Text,
    Card,
    Button,
    BlockStack,
    InlineStack,
    FormLayout,
    TextField,
    PageActions,
    Modal,
    Label,
    Box,
} from "@shopify/polaris";
import {
    DeleteIcon,
    EditIcon
} from '@shopify/polaris-icons';
import TemplateVisibilitySection from "../TemplateVisibilitySection/TemplateVisibilitySection";
import "./pageform.css";
import { EditorComponent } from "../RichText/RichText";
import { cleanEditorHtml, generateHandle, ShopifyPageId } from "app/utils/helpers";
import { PageFormValues, PageFormProps } from "app/types";

const initialEmptyState: PageFormValues = {
    id: undefined,
    title: "",
    handle: "",
    body: "",
    templateSuffix: null,
    seoTitle: "",
    seoDescription: "",
    publishedAt: null,
    isPublished: false,
};

export default function PageForm({
    mode,
    defaultValues = {},
    onSubmit,
    onDelete,
    onDuplicate,
    isLoading = false,
    shopDomain
}: PageFormProps) {
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditSeo, setIsEditSeo] = useState(false)
    const [isHandleManuallySet, setIsHandleManuallySet] = useState(false);
    const [formState, setFormState] = useState<PageFormValues>({
        id: defaultValues?.id,
        title: defaultValues?.title || "",
        handle: defaultValues?.handle || "",
        body: defaultValues?.body || "",
        templateSuffix: defaultValues?.templateSuffix || null,
        seoTitle: defaultValues?.seoTitle || "",
        seoDescription: defaultValues?.seoDescription || "",
        publishedAt: defaultValues?.publishedAt || null,
        isPublished: defaultValues?.isPublished || false,
    });
    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateForm, setDuplicateForm] = useState<string>("");

    // --- sync when defaultValues changes (edit mode) ---
    useEffect(() => {
        if (Object.keys(defaultValues).length > 0) {
            setFormState(prev => ({ ...prev, ...defaultValues }));

            if (defaultValues.title) {
                const autoHandle = generateHandle(defaultValues.title);
                setIsHandleManuallySet(defaultValues.handle !== autoHandle);
            } else {
                setIsHandleManuallySet(false);
            }
        }
    }, [defaultValues]);

    //create handle title automative
    useEffect(() => {
        if (formState.title) {
            const autoHandle = generateHandle(formState.title);
            if (!isHandleManuallySet && mode === 'create') {
                setFormState(prev => ({
                    ...prev,
                    handle: autoHandle,
                }));
            }
        }
    }, [formState.title, isHandleManuallySet]);


    // Auto-generate seoTitle from title if not set
    useEffect(() => {
        if (!formState.seoTitle && formState.title) {
            setFormState((prev) => ({ ...prev, seoTitle: prev.title }));
        }
    }, [formState.title, formState.seoTitle]);

    // --- helper update field in page input ---
    const updateField = useCallback(
        <K extends keyof PageFormValues>(field: K) =>
            (value: PageFormValues[K]) => {
                setFormState(prev => ({ ...prev, [field]: value }));
                // Track if handle is manually set
                if (field === 'handle') {
                    setIsHandleManuallySet(true);
                }
            },
        []
    );


    // --- handle submit SAVE ---
    const handleSubmit = useCallback(() => {
        const submitData: PageFormValues = {
            ...formState,
            title: formState.title.trim(),
            body: cleanEditorHtml(formState.body),
            handle:
                formState.handle.trim() ||
                formState.title.toLowerCase().replace(/\s+/g, "-"),
            seoTitle: formState.seoTitle?.trim() || formState.title,
            seoDescription: formState.seoDescription?.trim() || "",
        };
        console.log('submitData>> ', submitData)
        onSubmit(submitData)
    }, [formState, onSubmit]);


    //Discard value
    const handleDiscard = useCallback(() => {
        if (mode === "create") {
            // reset rỗng
            setFormState(initialEmptyState);
            setIsHandleManuallySet(false);
        } else {
            // khôi phục về defaultValues ban đầu
            setFormState({
                id: defaultValues?.id,
                title: defaultValues?.title || "",
                handle: defaultValues?.handle || "",
                body: defaultValues?.body || "",
                templateSuffix: defaultValues?.templateSuffix || null,
                seoTitle: defaultValues?.seoTitle || "",
                seoDescription: defaultValues?.seoDescription || "",
                publishedAt: defaultValues?.publishedAt || null,
                isPublished: defaultValues?.isPublished || false,
            });
            // đồng bộ lại cờ handle manually set
            if (defaultValues.handle && defaultValues.title) {
                const autoHandle = generateHandle(defaultValues.title);
                setIsHandleManuallySet(defaultValues.handle !== autoHandle);
            } else {
                setIsHandleManuallySet(false);
            }
        }
        setHasChanges(false)
    }, [mode, defaultValues])


    const handleView = () => {
        if (!defaultValues?.id) return;
        // Shop domain của bạn
        const idPageNum = ShopifyPageId.extract(defaultValues.id)
        console.log('idPageNum', idPageNum)

        // URL preview qua App Proxy
        const previewUrl = `https://${shopDomain}/a/preview/${encodeURIComponent(idPageNum as string)}`;
        // const previewUrl = `https://${shopDomain}/a/pf_preview/${pageId}`;

        console.log("previewUrl>> ", previewUrl);

        window.open(previewUrl, "_blank", 'noopener,noreferrer');
    };

    useEffect(() => {
        // object để so sánh
        const currentData = JSON.stringify({
            title: formState.title,
            handle: formState.handle,
            body: formState.body,
            templateSuffix: formState.templateSuffix,
            seoTitle: formState.seoTitle,
            seoDescription: formState.seoDescription,
            publishedAt: formState.publishedAt,
            isPublished: formState.isPublished,
        });

        const baseData =
            mode === "create"
                ? JSON.stringify({
                    title: "",
                    handle: "",
                    body: "",
                    templateSuffix: null,
                    seoTitle: "",
                    seoDescription: "",
                    publishedAt: null,
                    isPublished: false,
                })
                : JSON.stringify({
                    title: defaultValues.title,
                    handle: defaultValues.handle,
                    body: defaultValues.body,
                    templateSuffix: defaultValues.templateSuffix,
                    seoTitle: defaultValues.seoTitle,
                    seoDescription: defaultValues.seoDescription,
                    publishedAt: defaultValues.publishedAt,
                    isPublished: defaultValues.isPublished,
                });

        setHasChanges(currentData !== baseData);
    }, [formState, defaultValues, mode]);


    const openDuplicateModal = useCallback(() => {
        const sourceTitle = formState?.title ?? defaultValues?.title ?? "";
        setDuplicateForm(`copy of ${sourceTitle}`);
        setShowDuplicateModal(true);
    }, [formState?.title, defaultValues?.title]);

    useEffect(() => {
        console.log('pageform>> ', formState)
    }, [formState, defaultValues])
    return (
        <>
            <Page
                backAction={{ content: 'pages', url: '/pages', }}
                title={mode === 'edit' ? `${defaultValues?.title}` : `Add Page`}
                secondaryActions={mode === 'edit' && [
                    { content: 'Duplicate', disabled: isLoading, onAction: openDuplicateModal },
                    { content: 'View', disabled: isLoading, onAction: handleView },
                    { content: 'Delete', destructive: true, icon: DeleteIcon, onAction: () => setShowDeleteModal(true), disabled: isLoading },
                ]}
            >

                <BlockStack gap="500">
                    <Layout>
                        {/* LEFT */}
                        <Layout.Section>
                            <BlockStack
                                gap="500"
                            >
                                <Card >
                                    <Box >
                                        <TextField
                                            value={formState.title}
                                            onChange={updateField('title')}
                                            label="Title"
                                            type="text"
                                            placeholder="e.g. about us, sizing chart, FAQ"
                                            autoComplete="off"
                                            disabled={isLoading}
                                        />
                                    </Box>
                                    <Box paddingBlockStart="200">
                                        <Label id="myLabel">Content</Label>
                                        {/* <TextField
                                            value={formState.body}
                                            onChange={updateField('body')}
                                            label="Content"
                                            type="text"
                                            multiline={8}
                                            autoComplete="off"
                                            disabled={isLoading}
                                            verticalContent={verticalContentMarkup}

                                        /> */}
                                        <EditorComponent content={formState.body} onChange={updateField('body')} />
                                    </Box>

                                </Card>

                                <BlockStack>
                                    <Card>
                                        <BlockStack gap="200" >
                                            <InlineStack align="space-between">
                                                <Text as="h3" variant="headingSm">
                                                    Search engine listing
                                                </Text>
                                                <Button
                                                    size="micro"
                                                    icon={EditIcon}
                                                    variant="tertiary"
                                                    onClick={() => setIsEditSeo(!isEditSeo)}
                                                    disabled={isLoading}
                                                />
                                            </InlineStack>
                                            {formState.title ?
                                                <BlockStack gap="200">
                                                    <BlockStack>
                                                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                            {shopDomain ? shopDomain.split('.')[0] : 'your store name'}
                                                        </Text>
                                                        <Text variant="bodySm" tone="subdued" as="p">
                                                            https://{shopDomain} &#8250; pages  &#8250; {formState.handle}
                                                        </Text>
                                                    </BlockStack>
                                                    <Text variant="headingLg" tone="magic" as="p" fontWeight="regular">
                                                        {formState.seoTitle || formState.title}
                                                    </Text>
                                                    {
                                                        formState.seoDescription &&
                                                        <Text variant="bodyMd" tone="base" as="p">
                                                            {formState.seoDescription}
                                                        </Text>
                                                    }
                                                </BlockStack>
                                                :
                                                <Text variant="bodyMd" as="p">
                                                    Add a title and description to see how this page might appear in a search engine listing
                                                </Text>
                                            }
                                        </BlockStack>
                                    </Card>
                                    {
                                        isEditSeo &&
                                        <Card>
                                            <BlockStack gap="500">
                                                <FormLayout>
                                                    <TextField
                                                        value={formState.seoTitle || ''}
                                                        onChange={updateField('seoTitle')}
                                                        label="Page Title"
                                                        type="text"
                                                        placeholder={formState.seoTitle ? '' : formState.title}
                                                        autoComplete="off"
                                                        helpText={`${formState.seoTitle?.length} of 70 characters used`}
                                                        disabled={isLoading}
                                                    />
                                                    <TextField
                                                        value={formState.seoDescription || ''}
                                                        onChange={updateField('seoDescription')}
                                                        label="Meta description"
                                                        type="text"
                                                        multiline={4}
                                                        autoComplete="off"
                                                        helpText={`${formState.seoDescription?.length} of 160 characters used`}
                                                        disabled={isLoading}
                                                    />
                                                    <TextField
                                                        label="URL Handle"
                                                        value={formState.handle}
                                                        onChange={updateField("handle")}
                                                        helpText={`https://${shopDomain}/pages/${formState.handle}`}
                                                        prefix="/pages/"
                                                        autoComplete="off"
                                                    />
                                                </FormLayout>
                                            </BlockStack>
                                        </Card>
                                    }
                                </BlockStack>
                            </BlockStack>
                        </Layout.Section>

                        {/* RIGHT */}
                        <Layout.Section variant="oneThird">
                            <TemplateVisibilitySection
                                templateSuffix={formState.templateSuffix}
                                publishedAt={formState.publishedAt}
                                onChangeTemplateSuffix={updateField('templateSuffix')}
                                onChangePublishedAt={updateField('publishedAt')}
                                onChangeIsPublished={updateField('isPublished')}
                                disabled={isLoading}
                            />
                        </Layout.Section>
                    </Layout >
                </BlockStack >
                <PageActions
                    primaryAction={{
                        content: 'Save',
                        onAction: handleSubmit,
                        disabled: isLoading || !hasChanges,
                        loading: isLoading
                    }}
                    secondaryActions={[
                        {
                            content: 'Discard',
                            onAction: handleDiscard,
                            disabled: isLoading || !hasChanges,
                        }
                    ]}
                />
            </Page >

            {/* MODAL DELETE */}
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete page"
                primaryAction={{
                    content: 'Delete',
                    onAction: onDelete,
                    destructive: true,
                    loading: isLoading
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setShowDeleteModal(false),
                        disabled: isLoading
                    }
                ]}
            >
                <Modal.Section>
                    <Text as="p" fontWeight='regular' >
                        Are you sure you want to delete the page? This can’t be undone.
                    </Text>
                </Modal.Section>
            </Modal>

            {/* DUPLICATE MODEL */}
            <Modal
                open={showDuplicateModal}
                onClose={() => setShowDuplicateModal(false)}
                title="Duplicate page?"
                primaryAction={{
                    content: 'Duplicate',
                    onAction: () => onDuplicate && onDuplicate(duplicateForm.trim()),
                    loading: isLoading,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setShowDuplicateModal(false),
                        disabled: isLoading
                    }
                ]}
            >
                <Modal.Section>
                    <TextField
                        value={duplicateForm}
                        onChange={(value: string) => setDuplicateForm(value)}
                        label="Title"
                        type="text"
                        placeholder="e.g. about us, sizing chart, FAQ"
                        autoComplete="off"
                        disabled={isLoading}
                        autoFocus
                    />
                </Modal.Section>
            </Modal>
        </>

    );
}