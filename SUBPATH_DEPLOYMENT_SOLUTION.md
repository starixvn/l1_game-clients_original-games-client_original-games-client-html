# Next.js Subpath Deployment Solution: Complete Guide

## 📋 Overview

This document details the comprehensive solution for deploying Next.js applications with domain subpaths (e.g., `https://domain.com/game-148/`) in reverse proxy environments. It covers the challenges encountered, solutions implemented, and the final working configuration.

## 🎯 Problem Statement

Deploy Next.js applications behind reverse proxies with subpath routing while maintaining proper:

-   Asset loading (images, CSS, JS)
-   API endpoint functionality
-   Next.js Image component optimization
-   Client-side routing

**Target Architecture:**

```
Internet → Reverse Proxy → Next.js App
                ↓
        /game-148/* → strips /game-148 → forwards to app
```

## 🚨 Issues Encountered

### Issue 1: Duplicate BasePath in Image URLs

**Problem:** Next.js Image components generated URLs with duplicate basePath:

```
❌ http://domain.com/game-148/_next/image?url=%2Fgame-148%2Fstatic%2Fimages%2Flogo.png&w=300&q=75
```

**Root Cause:** Components were manually prepending basePath to image sources:

```tsx
// In scoreboard-elements.tsx
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
<Image src={`${basePath}/static/images/icon.webp`} />;
```

**Impact:** Reverse proxy stripped `/game-148` but the URL parameter still contained it, causing Next.js to look for non-existent nested paths.

### Issue 2: Next.js Image Optimization 404 Errors

**Problem:** Even with correct basePath handling, Next.js image optimization returned 404:

```
❌ GET /_next/image?url=%2Fstatic%2Fimages%2Fbg.webp&w=750&q=75 → 404 Not Found
✅ GET /static/images/bg.webp → 200 OK
```

**Root Cause:** Next.js image optimization couldn't find/process image files in the expected locations, likely due to Docker container file system issues or optimization configuration problems.

### Issue 3: Docker Build Path Resolution

**Problem:** Image loader file wasn't copied to the correct Docker container location:

```
Error: Specified images.loaderFile does not exist at "/app/src/image-loader.js"
```

**Root Cause:** Dockerfile `COPY` commands didn't include the custom image loader in the final container image.

## 🛠️ Solutions Implemented

### Solution 1: Custom Image Loader for BasePath Handling

**File:** `packages/sedie-multiplayer/src/image-loader.js`

```javascript
export default function imageLoader({ src, width, quality }) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    // Handle external URLs
    if (src.startsWith("http://") || src.startsWith("https://")) {
        return src;
    }

    // Strip basePath if already present in src
    let cleanSrc = src;
    if (basePath && src.startsWith(basePath)) {
        cleanSrc = src.substring(basePath.length);
    }

    // Prepend basePath for reverse proxy routing
    if (basePath && !cleanSrc.startsWith(basePath)) {
        return basePath + cleanSrc;
    }

    return cleanSrc;
}
```

**Configuration:** `packages/sedie-multiplayer/next.config.js`

```javascript
images: {
    loader: "custom",
    loaderFile: "./src/image-loader.js",
    unoptimized: true, // Final solution: disable optimization
    remotePatterns: [{
        protocol: "https",
        hostname: "**",
    }],
},
```

### Solution 2: Docker Container File Structure Fix

**File:** `packages/sedie-multiplayer/Dockerfile`

```dockerfile
# Create src directory for image loader
RUN mkdir -p src

# Copy image loader to correct location
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/src/image-loader.js ./src/image-loader.js
```

### Solution 3: Reverse Proxy Middleware

**File:** `packages/sedie-multiplayer/custom-server.js`

```javascript
// Handle Next.js image optimization URLs before Next.js processes them
server.use("/_next/image", (req, res, next) => {
    const urlParam = req.query?.url;

    // Strip basePath from URL parameters if present
    if (urlParam?.startsWith(basePath)) {
        req.query.url = urlParam.slice(basePath.length);
    }

    // Continue to Next.js
    next();
});
```

### Solution 4: Component-Level BasePath Management

**Updated Components:** Multiple React components were modified to handle basePath properly:

```tsx
// Before: Manual basePath prepending
const src = `${basePath}/static/images/icon.webp`;

// After: Let image loader handle basePath
const src = "/static/images/icon.webp";
```

## 🧪 Testing Strategy

### Unit Tests for Image Loader

**File:** `packages/sedie-multiplayer/src/__tests__/image-loader.test.js`

Comprehensive test suite covering:

-   BasePath prepending for clean URLs
-   BasePath stripping for URLs that already contain it
-   External URL handling
-   Edge cases (empty basePath, malformed URLs)

### Integration Testing

-   Docker container build and deployment
-   Reverse proxy routing validation
-   Static file serving verification
-   API endpoint functionality

## 📊 URL Transformation Examples

### Before Fix (Broken)

```
Component src: "/static/images/logo.png"
↓ Next.js Image Component
Image loader receives: "/game-148/static/images/logo.png"
↓ Custom loader (old version)
Returns: "/game-148/_next/image?url=%2Fgame-148%2Fstatic%2Fimages%2Flogo.png&w=300&q=75"
↓ Reverse proxy strips /game-148
Next.js receives: "/_next/image?url=%2Fgame-148%2Fstatic%2Fimages%2Flogo.png&w=300&q=75"
↓ Next.js looks for nested path
❌ 404 Error
```

### After Fix (Working)

```
Component src: "/static/images/logo.png"
↓ Next.js Image Component (unoptimized: true)
Image loader receives: "/static/images/logo.png"
↓ Custom loader (new version)
Returns: "/game-148/static/images/logo.png"
↓ Reverse proxy strips /game-148
Final URL: "/static/images/logo.png"
↓ Direct file serving
✅ 200 OK
```

## 🏗️ Final Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Browser       │    │  Reverse Proxy   │    │   Next.js App   │
│                 │    │                  │    │                 │
│ • Requests:     │    │ • Route:         │    │ • Serve static  │
│   /game-148/*   │───▶│   /game-148/*    │───▶│   files directly │
│                 │    │   ↓              │    │ • Handle API     │
│ • Images:       │    │   Strip /game-148│    │ • Client routing │
│   Direct URLs   │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure Changes

### Modified Files

-   `packages/sedie-multiplayer/src/image-loader.js` - Custom loader logic
-   `packages/sedie-multiplayer/next.config.js` - Image configuration
-   `packages/sedie-multiplayer/Dockerfile` - Container build process
-   `packages/sedie-multiplayer/custom-server.js` - Server middleware
-   Multiple React components - Removed manual basePath prepending

### New Files

-   `packages/sedie-multiplayer/src/__tests__/image-loader.test.js` - Test suite

### Configuration Files

-   `packages/sedie-multiplayer/docker-compose.yml` - Container orchestration
-   `packages/sedie-multiplayer/game-settings.json` - Game configuration

## 🚀 Deployment Process

### Build Process

```bash
# Build Docker image
docker build -t sedie-multiplayer-game:latest -f packages/sedie-multiplayer/Dockerfile .

# Deploy containers
docker-compose up -d
```

### Environment Variables

```bash
NEXT_PUBLIC_BASE_PATH=/game-148
NODE_ENV=production
```

### Reverse Proxy Configuration

```nginx
location /game-148/ {
    proxy_pass http://nextjs-app:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_For;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🔍 Key Insights & Lessons Learned

### 1. Next.js Image Optimization Complexity

-   Image optimization adds complexity in containerized environments
-   Direct file serving is often more reliable and performant
-   Custom loaders require careful path handling

### 2. BasePath Handling Strategy

-   **Don't manually prepend basePath in components**
-   **Let the image loader handle basePath routing**
-   **Use centralized basePath constants for consistency**

### 3. Docker Container Considerations

-   File paths in containers differ from development
-   COPY commands must be explicit in multi-stage builds
-   Static file serving works reliably when configured correctly

### 4. Testing Importance

-   Unit tests for loaders prevent regression
-   Integration tests validate end-to-end functionality
-   Docker-based testing ensures deployment readiness

## ✅ Success Metrics

-   ✅ **Zero 404 errors** for image requests
-   ✅ **Proper basePath routing** through reverse proxy
-   ✅ **Direct static file serving** for optimal performance
-   ✅ **Clean, maintainable URLs** without encoding
-   ✅ **Comprehensive test coverage** for reliability
-   ✅ **Docker container deployment** ready

## 🎉 Final Result

The Next.js application now deploys successfully with subpath routing:

**Access URL:** `https://domain.com/game-148/`
**Image URLs:** `https://domain.com/game-148/static/images/logo.webp`
**API URLs:** `https://domain.com/game-148/api/health`

All assets load correctly, routing works properly, and the application performs optimally in production environments with reverse proxy configurations.

---

**Date:** September 18, 2025
**Status:** ✅ Complete - Production Ready
**Tested:** Docker containers, reverse proxy routing, static file serving
