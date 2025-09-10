import { FooterHelp, Link } from '@shopify/polaris';

export default function FooterHelpPages() {
    return (
        <FooterHelp>
            Learn more about{' '}
            <Link target='_blank' url="https://help.shopify.com/en/manual/online-store/add-edit-pages">
                pages
            </Link>
        </FooterHelp>
    );
}