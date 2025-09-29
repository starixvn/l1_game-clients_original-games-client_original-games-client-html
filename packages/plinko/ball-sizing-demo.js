/**
 * Ball Sizing Demo Script
 * Demonstrates the dynamic ball sizing calculations for Plinko game
 *
 * @format
 */

// Configuration (copied from the main component)
const ballSizingConfig = {
  baseRows: 10, // Reference row count for base sizing
  baseDiameter: 20, // Base ball diameter in pixels at baseRows
  minDiameter: 8, // Minimum ball diameter to prevent invisibility
  maxDiameter: 35, // Maximum ball diameter to prevent overcrowding
  sizeScaleFactor: 0.8, // Additional scaling factor for peg gap consideration
};

/**
 * Calculate dynamic ball size based on number of rows
 * Formula: ballDiameter = baseDiameter / (rows / baseRows)
 * With clamping between minDiameter and maxDiameter
 */
function calculateBallSize(rows, canvasScaleFactor = 1) {
  // Validate input
  if (!rows || rows < 1) {
    console.warn("Invalid rows count, using minimum rows:", rows);
    rows = 1;
  }

  if (rows > 50) {
    console.warn("Very high row count detected, clamping to 50:", rows);
    rows = 50;
  }

  // Core size calculation: inversely proportional to rows
  const rawDiameter =
    ballSizingConfig.baseDiameter / (rows / ballSizingConfig.baseRows);

  // Apply peg gap consideration (ball should be ~80% of typical peg gap)
  const pegGapBasedSize = ballSizingConfig.sizeScaleFactor * rawDiameter;

  // Clamp between min and max diameters
  const clampedDiameter = Math.max(
    ballSizingConfig.minDiameter,
    Math.min(ballSizingConfig.maxDiameter, pegGapBasedSize)
  );

  // Apply canvas responsive scaling
  const finalDiameter = clampedDiameter * canvasScaleFactor;

  // Convert diameter to radius for Matter.js (and ensure minimum size)
  const radius = Math.max(2, finalDiameter / 2);

  return {
    rows,
    rawDiameter: rawDiameter.toFixed(1),
    pegGapBasedSize: pegGapBasedSize.toFixed(1),
    clampedDiameter: clampedDiameter.toFixed(1),
    canvasScaleFactor: canvasScaleFactor.toFixed(2),
    finalDiameter: finalDiameter.toFixed(1),
    radius: radius.toFixed(1),
  };
}

/**
 * Get visual feedback parameters based on ball size
 */
function getBallPhysicsTweaks(ballRadius) {
  const sizeRatio = ballRadius / (ballSizingConfig.baseDiameter / 2);

  return {
    restitution: 0.8 + sizeRatio * 0.2, // Larger balls bounce more (0.8-1.0)
    frictionAir: 0.02 + sizeRatio * 0.03, // Larger balls fall slower (0.02-0.05)
    density: 0.001 * (2 - sizeRatio), // Larger balls have more mass relative to size
  };
}

/**
 * Demo function to test ball sizing calculations
 */
function demoBallSizing() {
  console.log("🎯 Plinko Ball Sizing Demo");
  console.log("=".repeat(50));

  const testCases = [
    { rows: 1, description: "Minimum rows (max ball size)" },
    { rows: 5, description: "Low risk setting" },
    { rows: 8, description: "Low-medium risk" },
    { rows: 10, description: "Base reference (normal size)" },
    { rows: 12, description: "Medium-high risk" },
    { rows: 16, description: "High risk setting" },
    { rows: 20, description: "Very high risk (min ball size)" },
    { rows: 25, description: "Extreme volatility" },
  ];

  testCases.forEach(({ rows, description }) => {
    const sizeData = calculateBallSize(rows);
    const physics = getBallPhysicsTweaks(parseFloat(sizeData.radius));

    console.log(`${description} (${rows} rows):`);
    console.log(
      `  Diameter: ${sizeData.finalDiameter}px, Radius: ${sizeData.radius}px`
    );
    console.log(
      `  Physics: Bounce ${physics.restitution.toFixed(
        2
      )}, Air Resistance ${physics.frictionAir.toFixed(
        3
      )}, Density ${physics.density.toFixed(5)}`
    );
    console.log("");
  });

  console.log("Configuration:");
  console.log(
    `  Base Rows: ${ballSizingConfig.baseRows}, Base Diameter: ${ballSizingConfig.baseDiameter}px`
  );
  console.log(
    `  Size Range: ${ballSizingConfig.minDiameter}px - ${ballSizingConfig.maxDiameter}px`
  );
  console.log(`  Scale Factor: ${ballSizingConfig.sizeScaleFactor}`);
}

// Run the demo
demoBallSizing();
