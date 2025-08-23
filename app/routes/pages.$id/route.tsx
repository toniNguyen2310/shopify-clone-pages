// import {
//     Box,
//     Card,
//     Layout,
//     Link,
//     List,
//     Page,
//     Text,
//     BlockStack,
// } from "@shopify/polaris";
// import { TitleBar } from "@shopify/app-bridge-react";
// import { LoaderFunctionArgs } from "@remix-run/node";
// import { authenticate } from "app/shopify.server";
// import { useLoaderData } from "@remix-run/react";
// export async function loader({ params, request }: LoaderFunctionArgs) {
//     console.log('=== EDIT PAGE LOADER CALLED ===');
//     try {
//         const { session } = await authenticate.admin(request);
//         console.log('✅ Authentication LOADER', session);

//         const { id } = params;
//         console.log('📄 Page ID param:', id);

//         if (!id) {
//             throw new Response("Page ID is required", { status: 400 });
//         }

//         return new Response(
//             JSON.stringify({
//                 id
//             }),
//             {
//                 headers: { "Content-Type": "application/json" },
//             }
//         );
//     } catch (error) {
//         console.error('❌ Error loading page:', error);
//         throw new Response("Internal server error", { status: 500 });
//     };
// }

// export default function EditPage() {
//     const { id } = useLoaderData<typeof loader>();

//     return (
//         <Page>
//             <TitleBar title={`Edit Page ${id}`} />
//             <Layout>
//                 <Layout.Section>
//                     <Card>
//                         <BlockStack gap="300">
//                             <Text as="p" variant="bodyMd">
//                                 The app template comes with an additional page which
//                                 demonstrates how to create multiple pages within app navigation
//                                 using{" "}
//                                 <Link
//                                     url="https://shopify.dev/docs/apps/tools/app-bridge"
//                                     target="_blank"
//                                     removeUnderline
//                                 >
//                                     App Bridge
//                                 </Link>
//                                 .
//                             </Text>
//                             <Text as="p" variant="bodyMd">
//                                 To create your own page and have it show up in the app
//                                 navigation, add a page inside <Code>app/routes</Code>, and a
//                                 link to it in the <Code>&lt;NavMenu&gt;</Code> component found
//                                 in <Code>app/routes/app.jsx</Code>.
//                             </Text>
//                         </BlockStack>
//                     </Card>
//                 </Layout.Section>
//                 <Layout.Section variant="oneThird">
//                     <Card>
//                         <BlockStack gap="200">
//                             <Text as="h2" variant="headingMd">
//                                 Resources
//                             </Text>
//                             <List>
//                                 <List.Item>
//                                     <Link
//                                         url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
//                                         target="_blank"
//                                         removeUnderline
//                                     >
//                                         App nav best practices
//                                     </Link>
//                                 </List.Item>
//                             </List>
//                         </BlockStack>
//                     </Card>
//                 </Layout.Section>
//             </Layout>
//         </Page>
//     );
// }

// function Code({ children }: { children: React.ReactNode }) {
//     return (
//         <Box
//             as="span"
//             padding="025"
//             paddingInlineStart="100"
//             paddingInlineEnd="100"
//             background="bg-surface-active"
//             borderWidth="025"
//             borderColor="border"
//             borderRadius="100"
//         >
//             <code>{children}</code>
//         </Box>
//     );
// }