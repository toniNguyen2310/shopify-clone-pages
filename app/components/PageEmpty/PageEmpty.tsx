import { useNavigate } from '@remix-run/react';
import { BlockStack, Button, Card, EmptyState, Text } from '@shopify/polaris'

export const PageEmpty = () => {
    const navigate = useNavigate();

    return (
        <Card >
            <BlockStack gap='200'>
                <EmptyState
                    heading=" Add pages to your online store"
                    action={{ content: 'Add Pages', onAction: () => navigate('/pages/new') }}
                    image={'https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/empty-state-pages-DXfvzw9LGPbA.svg'} // Hoặc import illustration khác
                >
                    <p>
                        Write clear page titles and descriptions to improve your search engine<br></br>
                        optimization (SEO) and help customers find your website.<br></br>                    </p>
                </EmptyState>
            </BlockStack>
        </Card>

    )
}
