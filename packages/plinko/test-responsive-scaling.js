// Test script for responsive scaling behavior
// Run this in the browser console to test different viewport sizes

const testResponsiveScaling = () => {
    console.log("🧪 Testing Plinko Responsive Scaling");

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

    // Function to calculate expected scaling
    const calculateExpectedScaling = (viewportWidth, viewportHeight) => {
        const baseGameWidth = 1050;
        const baseGameHeight = 600;

        const scaleX = viewportWidth / baseGameWidth;
        const scaleY = viewportHeight / baseGameHeight;
        const containerScale = Math.min(scaleX, scaleY);
        const boundedScale = Math.max(0.3, Math.min(1.0, containerScale));

        return {
            scaleX,
            scaleY,
            containerScale,
            boundedScale,
            expectedGameWidth: baseGameWidth * boundedScale,
            expectedGameHeight: baseGameHeight * boundedScale,
            willFitWidth: baseGameWidth * boundedScale <= viewportWidth,
            willFitHeight: baseGameHeight * boundedScale <= viewportHeight,
        };
    };

    // Test current viewport
    const currentViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
    };

    console.log("📱 Current Viewport:", currentViewport);

    const currentScaling = calculateExpectedScaling(currentViewport.width, currentViewport.height);
    console.log("🎯 Current Expected Scaling:", currentScaling);

    // Test different sizes
    console.log("📊 Testing Different Viewport Sizes:");
    testSizes.forEach((size) => {
        const scaling = calculateExpectedScaling(size.width, size.height);
        console.log(`${size.name} (${size.width}x${size.height}):`, {
            containerScale: scaling.boundedScale.toFixed(3),
            gameSize: `${scaling.expectedGameWidth.toFixed(0)}x${scaling.expectedGameHeight.toFixed(0)}`,
            fitsViewport: scaling.willFitWidth && scaling.willFitHeight,
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
