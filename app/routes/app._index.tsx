import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  List,
  InlineStack,
  TextField,
  DataTable,
  Toast
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { connectDb } from "app/db.server";
import { ShopTheme } from "app/models/Theme";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  await connectDb();

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


export default function Index() {
  const { currentShop, themes, session } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [toastContent, setToastContent] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const isLoading = navigation.state === 'submitting';

  useEffect(() => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setPrimaryColor(randomColor);
    console.log('currentShop>> ', currentShop)
    console.log('session>> ', session)
  }, [])

  return (
    <>
      <Page>
        <TitleBar title="Clone Pages App">
          <button variant="primary" >
            Add new theme
          </button>
        </TitleBar>

        {/* 🆕 CREATE FORM */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Add New Theme</Text>

            <Form method="post">
              <input type="hidden" name="_action" value="create" />

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

                <div>
                  <Text variant="bodyMd" as="h1" >Primary Color</Text>
                  <InlineStack gap="200" align="center" blockAlign="center">
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
                </div>

                <Button
                  submit
                  variant="primary"
                  loading={isLoading && navigation.formData?.get('_action') === 'create'}
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
                {themes.map((theme: any) => (
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

                      {/* Delete Button */}
                      <Form method="post">
                        <input type="hidden" name="_action" value="delete" />
                        <input type="hidden" name="themeId" value={theme._id} />
                        <Button
                          submit
                          size="micro"
                          variant="plain"
                          tone="critical"
                          loading={isLoading && navigation.formData?.get('themeId') === theme._id}
                        >
                          Delete
                        </Button>
                      </Form>
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

      </Page>
      {toastContent && (
        <Toast
          content={toastContent}
          onDismiss={() => setToastContent(null)}
        />
      )}</>


  );
}