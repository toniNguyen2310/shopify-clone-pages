/**
 * Tiện ích xử lý Shopify GID cho Page
 */
export const ShopifyPageId = {
    /** 
     * Tách numeric ID từ GID 
     * (vd: "gid://shopify/Page/124459057377" → "124459057377")
     */
    extract(gid: string): string | null {
        if (!gid) return null;
        const parts = gid.split('/');
        return parts.length > 0 ? parts[parts.length - 1] : null;
    },

    /**
     * Tạo lại GID từ numeric id
     * (vd: "124459057377" → "gid://shopify/Page/124459057377")
     */
    build(id: string | number): string {
        return `gid://shopify/Page/${id}`;
    }
};

// Cách dùng:
const gid = "gid://shopify/Page/124459057377";
const id = ShopifyPageId.extract(gid); // "124459057377"

const newGid = ShopifyPageId.build(id!); // "gid://shopify/Page/124459057377"
