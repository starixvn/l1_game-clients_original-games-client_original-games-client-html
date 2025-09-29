// Custom image loader for Plinko game
// This handles basePath properly for reverse proxy environments

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

module.exports = function imageLoader({ src, width, quality }) {
    // Remove leading slash if present and basePath has trailing slash
    const cleanSrc = src.startsWith("/") ? src.slice(1) : src;

    // If src already includes basePath, don't add it again
    if (cleanSrc.startsWith(basePath.slice(1))) {
        return `${basePath}/${cleanSrc}?w=${width}&q=${quality || 75}`;
    }

    // Add basePath to src
    return `${basePath}/${cleanSrc}?w=${width}&q=${quality || 75}`;
};
