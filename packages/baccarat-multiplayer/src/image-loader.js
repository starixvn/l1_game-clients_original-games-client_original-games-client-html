/**
 * Custom Next.js Image Loader
 *
 * This loader prepends the basePath to image URLs so that _next/image requests
 * are generated with the correct basePath prefix for reverse proxy environments.
 */

export default function imageLoader({ src, width, quality }) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    // If the source already starts with http/https, it's an external URL - don't modify
    if (src.startsWith("http://") || src.startsWith("https://")) {
        return src;
    }

    // For internal images, ensure basePath is prepended for reverse proxy routing
    if (basePath && !src.startsWith(basePath)) {
        return basePath + src;
    }

    // If src already has basePath, return as-is
    return src;
}
