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
    Form,
    PageActions,
    Modal,

} from "@shopify/polaris";
import {
    EditIcon
} from '@shopify/polaris-icons';

import { useNavigate } from "@remix-run/react";
import TemplateVisibilitySection from "../TemplateVisibilitySection/TemplateVisibilitySection";
import { TitleBar } from "@shopify/app-bridge-react";


export type FormState = {
    [x: string]: any;
    title: string,
    content: string,
    pageTitle: string,
    metaDescription: string,
    visibility: string[],
    template: string,
};

type PageFormProps = {
    mode: "create" | "edit";
    initialState?: Partial<FormState>;
    onSubmit: (formData: FormState) => void;

    onDelete?: () => void;
    onDuplicate?: () => void;
    isLoading?: boolean;
    isDeleting?: boolean;
    isDuplicating?: boolean
};


export default function PageForm({
    mode,
    initialState = {},
    onSubmit,
    isLoading = false,
    onDelete,
    onDuplicate, isDeleting, isDuplicating
}: PageFormProps) {
    const navigate = useNavigate();
    const [isNavigate, setIsNavigate] = useState(false)
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditSeo, setIsEditSeo] = useState(false)
    const [formState, setFormState] = useState<FormState>({
        title: '',
        content: '',
        pageTitle: '',
        metaDescription: '',
        visibility: ['Hidden'],
        template: 'default',
        ...initialState,
    });
    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);

    // Cập nhật form state khi initialState thay đổi (cho edit mode)
    useEffect(() => {
        if (Object.keys(initialState).length > 0) {
            setFormState(prev => ({ ...prev, ...initialState }));
        }
    }, [initialState]);

    useEffect(() => {
        if (!formState.pageTitle) {
            setFormState((prev) => ({ ...prev, pageTitle: prev.title }));
        }
    }, [formState.title]);

    const updateField = useCallback((field: keyof FormState) => (value: string | string[]) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    }, [])

    const handleSubmit = useCallback(() => {
        onSubmit({
            ...formState,
            pageTitle: formState.pageTitle?.trim() || formState.title
        });
    }, [formState, onSubmit]);

    const handleDiscard = useCallback(() => {
        if (mode === 'create') {
            setFormState({
                title: '',
                content: '',
                pageTitle: '',
                metaDescription: '',
                visibility: ['Hidden'],
                template: 'default',
            });
        } else {
            setFormState({
                title: '',
                content: '',
                pageTitle: '',
                metaDescription: '',
                visibility: ['Hidden'],
                template: 'default',
                ...initialState,
            });
        }
    }, [mode, initialState])

    // Modal handlers
    const handleDeleteClick = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const handleDuplicateClick = useCallback(() => {
        setShowDuplicateModal(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (onDelete) {
            onDelete();
        }
    }, [onDelete]);

    const handleDuplicateConfirm = useCallback(() => {
        if (onDuplicate) {
            onDuplicate();
        }
    }, [onDuplicate]);

    // Close modals when operations complete
    useEffect(() => {
        if (!isDeleting) {
            setShowDeleteModal(false);
        }
    }, [isDeleting]);

    useEffect(() => {
        if (!isDuplicating) {
            setShowDuplicateModal(false);
        }
    }, [isDuplicating]);


    // Detect changes by comparing current state with initial state
    useEffect(() => {
        const currentData = JSON.stringify({
            title: formState.title,
            content: formState.content,
            pageTitle: formState.pageTitle,
            metaDescription: formState.metaDescription,
            visibility: formState.visibility,
            template: formState.template
        });

        const initialData = JSON.stringify({
            title: initialState.title || '',
            content: initialState.content || '',
            pageTitle: initialState.pageTitle || '',
            metaDescription: initialState.metaDescription || '',
            visibility: initialState.visibility || ['Hidden'],
            template: initialState.template || 'default'
        });

        setHasChanges(currentData !== initialData);
    }, [formState, initialState]);
    return (
        <>
            <Page>
                <TitleBar title="Create or Edit">
                    <button tone='critical' onClick={() => console.log('Duplicate')} >
                        Duplicate
                    </button>
                    <button onClick={() => console.log('Preview')} >
                        Preview
                    </button>
                    <button onClick={() => console.log('Delete')} >
                        Delete
                    </button>
                </TitleBar>

                <Form onSubmit={handleSubmit}>
                    <BlockStack gap="500">
                        <Layout>
                            {/* LEFT */}
                            <Layout.Section>
                                <BlockStack
                                    gap="500"
                                >
                                    <Card>
                                        <BlockStack gap="500">
                                            <FormLayout>
                                                <TextField
                                                    value={formState.title}
                                                    onChange={updateField('title')}
                                                    label="Title"
                                                    type="text"
                                                    placeholder="e.g. about us, sizing chart, FAQ"
                                                    autoComplete="off"
                                                    disabled={isLoading}
                                                />
                                                <TextField
                                                    value={formState.content}
                                                    onChange={updateField('content')}
                                                    label="Content"
                                                    type="text"
                                                    multiline={8}
                                                    autoComplete="off"
                                                    disabled={isLoading}
                                                />
                                            </FormLayout>
                                        </BlockStack>
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
                                                                Your store name
                                                            </Text>
                                                            <Text variant="bodySm" tone="subdued" as="p">
                                                                yourstore.myshopify.com/pages/{formState.title.toLowerCase().replace(/\s+/g, '-')}

                                                            </Text>
                                                        </BlockStack>
                                                        <Text variant="bodyMd" tone="magic" as="p">
                                                            {formState.pageTitle.trim() || formState.title}
                                                        </Text>
                                                        {
                                                            formState.metaDescription &&
                                                            <Text variant="bodyMd" tone="subdued" as="p">
                                                                {formState.metaDescription}
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
                                                            value={formState.pageTitle}
                                                            onChange={updateField('pageTitle')}
                                                            label="Page Title"
                                                            type="text"
                                                            placeholder={formState.pageTitle ? '' : formState.title}
                                                            autoComplete="off"
                                                            helpText={`${formState.pageTitle.length || ''} of 70 characters used`}
                                                            disabled={isLoading}
                                                        />
                                                        <TextField
                                                            value={formState.metaDescription}
                                                            onChange={updateField('metaDescription')}
                                                            label="Meta description"
                                                            type="text"
                                                            multiline={4}
                                                            autoComplete="off"
                                                            helpText={`${formState.metaDescription.length} of 160 characters used`}
                                                            disabled={isLoading}
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
                                    template={formState.template}
                                    visibility={formState.visibility}
                                    onChangeTemplate={updateField('template') as (val: string) => void}
                                    onChangeVisibility={updateField('visibility') as (val: string[]) => void}
                                    disabled={isLoading}
                                />
                            </Layout.Section>
                        </Layout >
                    </BlockStack >
                </Form>
                <PageActions
                    primaryAction={{
                        content: 'Save',
                        onAction: handleSubmit,
                        disabled: !hasChanges || isLoading,
                        loading: isLoading
                    }}
                    secondaryActions={[
                        {
                            content: 'Discard',
                            onAction: handleDiscard,
                            disabled: isLoading,
                        }
                    ]}
                />
            </Page >
            <Modal
                open={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                title="Delete page"
                primaryAction={{
                    content: isDeleting ? 'Deleting...' : 'Delete',
                    onAction: handleDeleteConfirm,
                    destructive: true,
                    loading: isDeleting
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setShowDeleteModal(false),
                        disabled: isDeleting
                    }
                ]}
            >
                <Modal.Section>
                    <Text as="p" fontWeight='regular' >
                        Are you sure you want to delete the page? This can’t be undone.
                    </Text>

                </Modal.Section>
            </Modal>

            {/* Duplicate Confirmation Modal */}
            <Modal
                open={showDuplicateModal}
                onClose={() => !isDuplicating && setShowDuplicateModal(false)}
                title="Duplicate page"
                primaryAction={{
                    content: isDuplicating ? 'Duplicating...' : 'Duplicate',
                    onAction: handleDuplicateConfirm,
                    loading: isDuplicating
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setShowDuplicateModal(false),
                        disabled: isDuplicating
                    }
                ]}
            >
                <Modal.Section>
                    <Text as="p" fontWeight='regular' >
                        Duplicate page? with Page title "{formState.title}"?
                    </Text>
                </Modal.Section>
            </Modal>
        </>

    );
}