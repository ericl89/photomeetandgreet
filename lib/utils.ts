import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanObject(obj: object): object {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, value]) => value != null && value !== "")
            .map(([key, value]) => [
                key,
                typeof value === "object" && !Array.isArray(value)
                    ? cleanObject(value)
                    : value
            ])
            .filter(([_, value]) =>
                typeof value === "object" ? Object.keys(value).length > 0 : true
            )
    );
}

export function getFancyTime(date:Date) {
    const dt = new Date(date);
    const hour = (dt.getHours() + 24) % 12 || 12;
    const ampm = dt.getHours() >= 12 ? 'pm' : 'am';
    // Pad the minutes
    const min = dt.getMinutes().toString().length === 1 ? "0" + dt.getMinutes() : dt.getMinutes();
    return hour + ":" + min + ampm;
}

export function getDateFromValues(date: Date, timeStr: string): Date {
    // Validate that `date` is a *valid* Date (e.g., not `new Date('bad')`)
    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid `date` argument. Expected a valid Date instance.");
    }

    const trimmed = timeStr.trim();
    const match = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/.exec(trimmed);
    if (!match) {
        throw new Error(
            `Invalid time format: "${timeStr}". Expected "H", "HH", "H:mm", "HH:mm", "H:mm:ss", or "HH:mm:ss".`
        );
    }

    const [, hStr, mStr = "0", sStr = "0"] = match;
    const hour = Number(hStr);
    const minute = Number(mStr);
    const second = Number(sStr);

    if (
        Number.isNaN(hour) || Number.isNaN(minute) || Number.isNaN(second) ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59 ||
        second < 0 || second > 59
    ) {
        throw new Error(`Invalid time values: "${timeStr}".`);
    }

    const result = new Date(date); // don’t mutate the input
    result.setHours(hour, minute, second, 0);
    return result;
}

/** Prevent open redirects: only allow same-origin paths. */
export function sanitizeNext(n: string | null): string | null {
    if (!n) return null;
    try {
        // Disallow absolute urls and protocol-relative
        if (n.startsWith("http://") || n.startsWith("https://") || n.startsWith("//")) return "/member";
        // Must start with a single leading slash
        if (!n.startsWith("/")) return "/member";
        return n;
    } catch { return "/member"; }
}