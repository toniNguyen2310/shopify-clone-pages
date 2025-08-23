import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { connectDb } from "app/db.server";
import { PageModel } from "app/models/Page";
import { useNavigation, useSubmit } from "@remix-run/react";
import { useCallback } from "react";
import PageForm, { FormState } from "app/components/PageForm/PageForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    return null;
};

export async function action({ request }: ActionFunctionArgs) {
    console.log('=== ACTION CALLED ===');
    try {
        const { session } = await authenticate.admin(request);
        console.log('✅ Authentication successful');
        console.log('SESSION IN ACTION:', session);

        const formData = await request.formData();
        const pageData = Object.fromEntries(formData) as any;
        await connectDb();
        console.log('🔗 Database connected');

        const newPage = {
            title: pageData.title,
            content: pageData.content,
            pageTitle: pageData.pageTitle,
            metaDescription: pageData.metaDescription,
            visibility: JSON.parse(pageData.visibility || '["Hidden"]'),
            template: pageData.template || 'default',
            status: "active",
        }
        const pageApi = await PageModel.create(newPage);

        console.log('✅ Page created successfully:', pageApi);
        return redirect(`/pages`)

    } catch (error) {
        console.error('Error creating page:', error);
        return new Response(
            JSON.stringify({ error: "Failed to create page" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
export default function AddPage() {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const submit = useSubmit();

    const handleSubmit = useCallback((formData: FormState) => {
        const submitData = new FormData();


        // Thêm các field vào form
        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                submitData.append(key, JSON.stringify(value));
            } else {
                submitData.append(key, String(value || ''));
            }
        });

        try {
            submit(submitData, {
                method: "post",
            });
            console.log('✅ Submit call completed');
        } catch (error) {
            console.error('❌ Submit error:', error);
        }
        console.log('run end')
    }, [submit]);
    // Log navigation changes
    console.log('🔄 Component render - navigation.state:', navigation.state);
    return (
        <PageForm mode="create" onSubmit={handleSubmit} isLoading={isSubmitting} />
    );
}