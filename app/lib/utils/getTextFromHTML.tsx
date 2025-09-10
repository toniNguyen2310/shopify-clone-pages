export function getTextFromHTML(html: string): string {
    // Loại bỏ tất cả tag HTML
    return html.replace(/<[^>]*>/g, '').trim();
}
