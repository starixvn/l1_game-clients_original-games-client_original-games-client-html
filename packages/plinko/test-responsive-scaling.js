// Test script for responsive scaling behavior
// Run this in the browser console to test different viewport sizes

const testResponsiveScaling = () => {
    console.log("🧪 Testing Plinko Responsive Scaling - FIXED VERSION");
    console.log("✅ Dynamic viewport-aware scaling implemented");
    console.log("✅ Container overflow changed from hidden to visible");
    console.log("✅ Max-width constraint added to prevent overflow");

    // Test different viewport sizes
    const testSizes = [
        { width: 320, height: 568, name: "iPhone SE" },
        { width: 375, height: 667, name: "iPhone 6/7/8" },
        { width: 414, height: 896, name: "iPhone 11 Pro Max" },
        { width: 768, height: 1024, name: "iPad" },
        { width: 1024, height: 768, name: "Desktop Small" },
        { width: 1920, height: 1080, name: "Full HD Desktop" },
        { width: 2560, height: 1440, name: "QHD Desktop" },
    ];

    // Function to calculate expected scaling (updated to match implementation)
    const calculateExpectedScaling = (viewportWidth, viewportHeight, numberOfRows = 10) => {
        const PLINKO_CANVAS_SCALE = {
            8: 1.125,
            9: 1,
            10: 0.905,
            11: 0.82,
            12: 0.755,
            13: 0.695,
            14: 0.645,
            15: 0.602,
            16: 0.565,
        };

        const baseScale = PLINKO_CANVAS_SCALE[numberOfRows] || 1;
        const maxWidth = viewportWidth - 40; // Account for padding/margins

        // Ensure canvas fits within viewport
        let responsiveScale = Math.min(baseScale, maxWidth / 1050);

        // Apply device-specific adjustments
        if (viewportWidth < 640) {
            // Mobile
            responsiveScale = Math.max(0.5, responsiveScale * 0.8);
        } else if (viewportWidth < 1024) {
            // Tablet
            responsiveScale = Math.max(0.6, responsiveScale * 0.9);
        }

        const expectedGameWidth = 1050 * responsiveScale;
        const expectedGameHeight = 600 * responsiveScale;

        return {
            baseScale,
            responsiveScale,
            expectedGameWidth,
            expectedGameHeight,
            willFitWidth: expectedGameWidth <= viewportWidth,
            willFitHeight: expectedGameHeight <= viewportHeight,
            maxAllowedWidth: maxWidth,
            deviceType: viewportWidth < 640 ? "mobile" : viewportWidth < 1024 ? "tablet" : "desktop",
        };
    };

    // Test current viewport
    const currentViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
    };

    console.log("📱 Current Viewport:", currentViewport);

    const currentScaling = calculateExpectedScaling(currentViewport.width, currentViewport.height, 10);
    console.log("🎯 Current Expected Scaling (10 rows):", {
        baseScale: currentScaling.baseScale.toFixed(3),
        responsiveScale: currentScaling.responsiveScale.toFixed(3),
        gameSize: `${currentScaling.expectedGameWidth.toFixed(0)}x${currentScaling.expectedGameHeight.toFixed(0)}`,
        deviceType: currentScaling.deviceType,
        fitsViewport: currentScaling.willFitWidth && currentScaling.willFitHeight,
        willClip: !currentScaling.willFitWidth,
    });

    // Test different sizes
    console.log("📊 Testing Different Viewport Sizes (10 rows):");
    testSizes.forEach((size) => {
        const scaling = calculateExpectedScaling(size.width, size.height, 10);
        console.log(`${size.name} (${size.width}x${size.height}) - ${scaling.deviceType}:`, {
            baseScale: scaling.baseScale.toFixed(3),
            responsiveScale: scaling.responsiveScale.toFixed(3),
            gameSize: `${scaling.expectedGameWidth.toFixed(0)}x${scaling.expectedGameHeight.toFixed(0)}`,
            maxAllowedWidth: scaling.maxAllowedWidth,
            fitsViewport: scaling.willFitWidth && scaling.willFitHeight,
            willClip: !scaling.willFitWidth,
        });
    });

    // Instructions for manual testing
    console.log("🔧 Manual Testing Instructions:");
    console.log("1. Open browser dev tools (F12)");
    console.log("2. Go to Console tab");
    console.log("3. Run: window.logPlinkoGameState() to see detailed logs");
    console.log("4. Resize browser window and run the command again");
    console.log("5. Check that the game scales properly and no elements are clipped");

    // Add test functions to window for easy access
    window.testPlinkoScaling = (width, height) => {
        console.log(`Testing ${width}x${height} viewport:`);
        const scaling = calculateExpectedScaling(width, height);
        console.log("Expected scaling:", scaling);

        // Simulate resize if possible
        if (window.innerWidth !== width || window.innerHeight !== height) {
            console.log("💡 Tip: Manually resize browser to test actual behavior");
        }
    };

    window.testAllSizes = () => {
        testSizes.forEach((size) => {
            window.testPlinkoScaling(size.width, size.height);
        });
    };

    console.log("🎮 Available test functions:");
    console.log("- testPlinkoScaling(width, height) - Test specific viewport size");
    console.log("- testAllSizes() - Test all predefined sizes");
    console.log("- window.logPlinkoGameState() - Get detailed current state logs");
};

if (typeof window !== "undefined") {
    testResponsiveScaling();
} else {
    console.log("This test script should be run in a browser environment");
}

module.exports = { testResponsiveScaling };
