/**
 * Loại bỏ các paragraph trống ở cuối HTML Tiptap
 * @param html HTML từ editor
 * @returns HTML đã loại bỏ paragraph trống cuối
 */
export function cleanEditorHtml(html: string): string {
    if (!html) return "";

    // Loại bỏ các <p>&nbsp;</p> hoặc <p> chỉ chứa space ở cuối
    return html.replace(/(<p>(&nbsp;|\s)*<\/p>)+$/g, '');
}


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

// Generate handle/slug từ title
export function generateHandle(title: string): string {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

//format time
export function formatTime(input: string): string {
    const date = new Date(input); // "2025-08-28T18:08:05Z"
    const now = new Date();

    // Tính ngày hôm nay, hôm qua
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // So sánh input date
    const inputDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let dayPart: string;
    if (inputDay.getTime() === today.getTime()) {
        dayPart = "Today";
    } else if (inputDay.getTime() === yesterday.getTime()) {
        dayPart = "Yesterday";
    } else {
        // Nếu xa hơn thì format theo ngày
        dayPart = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    // Format giờ (12h + am/pm)
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).toLowerCase();

    return `${dayPart} at ${timePart}`;
}

// Format date for display
export const formatPublishDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export function getTextFromHTML(html: string): string {
    // Loại bỏ tất cả tag HTML
    return html.replace(/<[^>]*>/g, '').trim();
}

