import { BlockStack, Card, Frame, Layout, SkeletonBodyText, SkeletonDisplayText, SkeletonPage } from '@shopify/polaris'
import { useEffect, useState } from 'react'
type PageSkeletonProps = {
    /** 'fullWidth' | 'narrowWidth' | 'default' */
    mode?: 'fullWidth' | 'narrowWidth' | 'default'
}

export const PageSkeleton = ({ mode = 'default' }: PageSkeletonProps) => {
    const pageProps =
        mode === 'fullWidth'
            ? { fullWidth: true }
            : mode === 'narrowWidth'
                ? { narrowWidth: true }
                : {}

    return (
        <Frame>
            <SkeletonPage {...pageProps} primaryAction >
                <Layout>
                    <Layout.Section>
                        <BlockStack gap="300">
                            <Card>
                                <SkeletonBodyText />
                            </Card>
                            <Card>
                                <BlockStack gap="500">
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText />
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap="500">
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText />
                                </BlockStack>
                            </Card>
                        </BlockStack>

                    </Layout.Section>
                </Layout>
            </SkeletonPage>
        </Frame>


    )
}
