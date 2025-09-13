import { useEffect, useState } from "react";

// Generic hook: value có thể là bất kỳ kiểu nào
export function useDebounce<T>(value: T, delay: number): T {
    // State và setter cho debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Update debounced value sau delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clear timeout khi value hoặc delay thay đổi hoặc unmount
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Chạy lại effect khi value hoặc delay thay đổi

    return debouncedValue;
}
