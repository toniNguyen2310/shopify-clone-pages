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

// Ví dụ:
// console.log(formatTime("2025-08-28T18:08:05Z"));
// 👉 "Yesterday at 2:08 pm" (nếu hôm nay là 2025-08-29)
