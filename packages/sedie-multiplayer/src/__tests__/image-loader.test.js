/**
 * Tests for custom Next.js Image Loader
 *
 * This loader prepends the basePath to image URLs so that _next/image requests
 * are generated with the correct basePath prefix for reverse proxy environments.
 */

const imageLoader = require("../image-loader");

describe("imageLoader", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment variables before each test
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        // Restore original environment after each test
        process.env = originalEnv;
    });

    describe("Happy Path - BasePath Configuration", () => {
        it("should prepend basePath to image URLs when NEXT_PUBLIC_BASE_PATH is set", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/logo.png", width: 300, quality: 80 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/static/images/logo.png");
        });

        it("should return src as-is if it already contains basePath", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/site-148/static/images/logo.png", width: 300, quality: 80 };

            // Act
            const result = imageLoader(params);

            // Assert - src is returned as-is since it already has basePath
            expect(result).toBe("/site-148/static/images/logo.png");
        });

        it("should handle default quality when not provided", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/logo.png", width: 300 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/static/images/logo.png");
        });
    });

    describe("External URLs", () => {
        it("should handle HTTPS external URLs correctly", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "https://cdn.example.com/image.jpg", width: 500, quality: 90 };

            // Act
            const result = imageLoader(params);

            // Assert - external URLs are returned as-is
            expect(result).toBe("https://cdn.example.com/image.jpg");
        });

        it("should handle HTTP external URLs correctly", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "http://cdn.example.com/image.jpg", width: 400, quality: 85 };

            // Act
            const result = imageLoader(params);

            // Assert - external URLs are returned as-is
            expect(result).toBe("http://cdn.example.com/image.jpg");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty basePath gracefully", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "";
            const params = { src: "/static/images/logo.png", width: 300, quality: 80 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/static/images/logo.png");
        });

        it("should handle undefined basePath gracefully", () => {
            // Arrange
            delete process.env.NEXT_PUBLIC_BASE_PATH;
            const params = { src: "/static/images/logo.png", width: 300, quality: 80 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/static/images/logo.png");
        });

        it("should handle root-relative src paths correctly", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/logo.png", width: 200, quality: 70 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/logo.png");
        });

        it("should handle src paths without leading slash", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "static/images/logo.png", width: 250, quality: 75 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148static/images/logo.png");
        });
    });

    describe("Error Handling", () => {
        it("should handle undefined quality parameter", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/logo.png", width: 300, quality: undefined };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/static/images/logo.png");
        });

        it("should handle null quality parameter", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/logo.png", width: 300, quality: null };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/static/images/logo.png");
        });
    });

    describe("URL Encoding", () => {
        it("should preserve special characters in src URL", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/logo with spaces.png", width: 300, quality: 80 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/static/images/logo with spaces.png");
        });

        it("should preserve query parameters in src URL", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/logo.png?v=1.2.3", width: 300, quality: 80 };

            // Act
            const result = imageLoader(params);

            // Assert
            expect(result).toBe("/site-148/static/images/logo.png?v=1.2.3");
        });
    });

    describe("Reverse Proxy Compatibility", () => {
        it("should prepend basePath to image URLs for reverse proxy routing", () => {
            // Arrange
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/static/images/game-icon.png", width: 100, quality: 90 };

            // Act
            const result = imageLoader(params);

            // Assert - URL should start with basePath to ensure reverse proxy handles it
            expect(result).toBe("/site-148/static/images/game-icon.png");
        });

        it("should generate URLs that reverse proxy can properly route", () => {
            // Arrange - Simulate the reverse proxy scenario described in the issue
            process.env.NEXT_PUBLIC_BASE_PATH = "/site-148";
            const params = { src: "/images/sprite.png", width: 64, quality: 85 };

            // Act
            const result = imageLoader(params);

            // Assert - The generated URL should include the basePath prefix
            expect(result).toBe("/site-148/images/sprite.png");

            // This ensures the URL matches the reverse proxy rule: /site-148/* → strips /site-148 → forwards to app
        });
    });
});
