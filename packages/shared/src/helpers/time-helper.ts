export const convertToGMT8 = (date) => {
    return new Date(
        date.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
        })
    );
};

export const formatDate = (date, template) => {
    try {
        var z = {
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
        };
        template = template.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
            return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);
        });

        return template.replace(/(y+)/g, function (v) {
            return date.getFullYear().toString().slice(-v.length);
        });
    } catch (ex) {
        return date.toString();
    }
};

export function sortedCollectionByTime(elements: any[], decrease = true) {
    const newElements = elements?.map((item) => {
        return {
            ...item,
            time: new Date(item.time),
        };
    });
    newElements?.sort((a, b) => {
        return decrease ? b.time - a.time : a.time - b.time;
    });
    return newElements;
}

// Helper function to normalize input to Date object
function normalizeToDate(rawTime: Date | string | number): Date | null {
    if (rawTime instanceof Date) {
        return rawTime;
    }
    
    if (typeof rawTime === "number") {
        // Heuristic: treat 13+ digit numbers as ms, 10-digit as seconds
        const asMs = rawTime > 1e12 ? rawTime : rawTime * 1000;
        return new Date(asMs);
    }
    
    if (typeof rawTime === "string") {
        const parsedFromString = new Date(rawTime);
        if (!Number.isNaN(parsedFromString.getTime())) {
            return parsedFromString;
        }
        
        // Try numeric string fallback (seconds or milliseconds)
        const numeric = Number(rawTime);
        if (!Number.isNaN(numeric)) {
            const asMs = numeric > 1e12 ? numeric : numeric * 1000;
            return new Date(asMs);
        }
    }
    
    return null;
}

// Helper function to format date and time
function formatDateTime(dateObject: Date, dateFormatLocale: string, timeFormatLocale: string) {
    const dateFormat = new Intl.DateTimeFormat(dateFormatLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false,
    });
    const timeFormat = new Intl.DateTimeFormat(timeFormatLocale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const date = dateFormat.format(dateObject);
    const time = timeFormat.format(dateObject);
    return { date, time };
}

export function separateDateTime(
    rawTime: Date | string | number,
    dateFormatLocale = "id",
    timeFormatLocale = "en-US"
) {
    // Normalize input to a valid Date instance
    const dateObject = normalizeToDate(rawTime);

    if (!dateObject || Number.isNaN(dateObject.getTime())) {
        return { date: "-", time: "-" };
    }

    return formatDateTime(dateObject, dateFormatLocale, timeFormatLocale);
}
