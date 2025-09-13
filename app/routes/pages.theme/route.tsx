import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import {
    Page,
    Text,
    Card,
    Button,
    BlockStack,
    List,
    InlineStack,
    TextField,
    Toast,
    Frame,
    Layout
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { connectDb } from "app/db.server";
import { ShopTheme } from "app/models/Theme";
import { useNavigationSkeleton } from "app/hooks/useNavigationSkeleton";


export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    await connectDb();
    console.log('LOADER> ')

    // Lấy tất cả themes
    const themes = await ShopTheme.find({}).lean();

    return new Response(
        JSON.stringify({
            currentShop: session.shop,
            themes: JSON.parse(JSON.stringify(themes)),
            session,
        }),
        {
            headers: { "Content-Type": "application/json" },
        }
    );


};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    await connectDb();

    const formData = await request.formData();
    const action = formData.get('_action');
    console.log('data> ', action)

    try {
        if (action === 'create') {
            const themeName = formData.get('themeName') as string;
            const primaryColor = formData.get('primaryColor') as string;

            if (!themeName || !primaryColor) {
                return new Response(
                    JSON.stringify({ error: 'Theme name and color are required' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            await ShopTheme.create({
                shopDomain: session.shop,
                themeName: themeName.trim(),
                primaryColor: primaryColor.toUpperCase(),
            });

            return new Response(
                JSON.stringify({ success: "Theme created!" }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        if (action === 'delete') {
            const themeId = formData.get('themeId') as string;
            await ShopTheme.findByIdAndDelete(themeId);
            console.log('themeId> ', themeId)

            return new Response(
                JSON.stringify({ success: "Theme deleted!" }),
                { headers: { "Content-Type": "application/json" } }
            );
        }


        return new Response(
            JSON.stringify({ error: "Invalid action" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error('Error:', error);

        if (error.code === 11000) {
            return new Response(
                JSON.stringify({ error: "Theme already exists for this shop" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (error.name === 'ValidationError') {
            return new Response(
                JSON.stringify({ error: "Invalid color format. Use #RRGGBB" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Something went wrong' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};


export default function ThemeCrud() {
    const { themes } = useLoaderData<typeof loader>();
    const actionData = useActionData<{ success?: string; error?: string }>();
    const navigation = useNavigation();
    const [themeName, setThemeName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#2364aa');
    const [toast, setToast] = useState<{ content: string; error?: boolean } | null>(null);
    const isLoading = navigation.state === 'submitting';
    const [listTheme, setListTheme] = useState([])
    const fetcher = useFetcher<typeof action>();
    const handleCreateTheme = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("_action", "create");
        fd.append("themeName", themeName);
        fd.append("primaryColor", primaryColor);
        fetcher.submit(fd, { method: "post" });
        setThemeName('')
    };


    const handleDeleteTheme = (id: string) => {
        const fd = new FormData();
        fd.append("_action", "delete");
        fd.append("themeId", id);
        fetcher.submit(fd, { method: "post" });
    };



    // useEffect(() => {
    //     if (actionData?.success) {
    //         console.log('actionData?.success>> ', actionData)
    //         setToast({ content: actionData.success });
    //         setThemeName("");
    //     } else if (actionData?.error) {
    //         setToast({ content: actionData.error, error: true });
    //     }
    // }, [actionData]);

    useEffect(() => {
        console.log('LOADER', themes)
        setListTheme(themes)
    }, [themes])


    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).success) {
            // phân biệt hành động dựa vào formData
            const action = fetcher.formData?.get('_action') as string;
            if (action === 'create') {
                // Thêm theme mới vào listTheme nếu muốn (phải trả theme mới từ action)
                setToast({ content: (fetcher.data as any).success });
                setThemeName("");
            }
            if (action === 'delete') {
                const deletedId = fetcher.formData?.get('themeId') as string;
                if (deletedId) {
                    setListTheme(prev => prev.filter((t: any) => t._id !== deletedId));
                    setToast({ content: (fetcher.data as any).success });
                }
            }
        }
    }, [fetcher.data]);

    const skeleton = useNavigationSkeleton();
    if (skeleton) return skeleton;
    return (
        <Frame>
            <Page>
                <Layout>
                    <Layout.Section>
                        {/* 🆕 CREATE FORM */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">Add New Theme</Text>

                                <Form onSubmit={handleCreateTheme}>

                                    <BlockStack gap="300">
                                        <TextField
                                            label="Theme Name"
                                            name="themeName"
                                            value={themeName}
                                            onChange={setThemeName}
                                            placeholder="e.g., Summer Theme"
                                            autoComplete="off"
                                            loading={isLoading}
                                        />


                                        <Text variant="bodyMd" as="h1" >Primary Color</Text>
                                        {primaryColor && <InlineStack gap="200" align="center" blockAlign="center">
                                            <input
                                                type="color"
                                                name="primaryColor"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                style={{
                                                    width: '50px',
                                                    height: '40px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}

                                            />
                                            <Text variant="bodyMd" fontWeight="bold" as="span">{primaryColor}</Text>
                                        </InlineStack>
                                        }

                                        <Button
                                            submit
                                            variant="primary"
                                            loading={fetcher.state === 'submitting'}
                                            disabled={!themeName.trim()}
                                        >
                                            Create Theme
                                        </Button>
                                    </BlockStack>
                                </Form>
                            </BlockStack>
                        </Card>

                        {/* 📋 THEMES LIST */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    All Themes ({themes.length})
                                </Text>

                                {themes.length > 0 ? (
                                    <List type="bullet">
                                        {listTheme && listTheme.map((theme: any) => (
                                            <List.Item key={theme._id}>
                                                <InlineStack gap="300" align="space-between">
                                                    <InlineStack gap="200" align="center">
                                                        {/* Color Preview */}
                                                        <div
                                                            style={{
                                                                width: '30px',
                                                                height: '30px',
                                                                backgroundColor: theme.primaryColor,
                                                                borderRadius: '6px',
                                                                border: '2px solid #ddd'
                                                            }}
                                                        />

                                                        <div>
                                                            <Text variant="bodyMd" as="p" fontWeight="semibold">
                                                                {theme.themeName}
                                                            </Text>
                                                            <Text variant="bodySm" as="p" tone="subdued">
                                                                {theme.shopDomain} • {theme.primaryColor}
                                                            </Text>
                                                        </div>
                                                    </InlineStack>


                                                    <Button
                                                        size="micro"
                                                        variant="plain"
                                                        tone="critical"
                                                        onClick={() => handleDeleteTheme(theme._id)}
                                                        loading={fetcher.state === 'submitting'}
                                                    >
                                                        Delete
                                                    </Button>
                                                </InlineStack>
                                            </List.Item>
                                        ))}
                                    </List>
                                ) : (
                                    <Text variant="bodyMd" tone="subdued" fontWeight="bold" as="h3">
                                        No themes yet. Create your first theme above!
                                    </Text>
                                )}
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>


            {toast && (
                <Toast
                    content={toast.content}
                    error={toast.error}
                    onDismiss={() => setToast(null)}
                />
            )}
        </Frame>
    );
}