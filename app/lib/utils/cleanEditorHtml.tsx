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
