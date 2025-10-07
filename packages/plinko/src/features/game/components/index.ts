// Game feature components

// Ball components
export { default as BallLayout } from "./ball/ball-layout";
export type { SimplifiedCanvasBallLayoutRef } from "./ball/ball-layout";

// Ball test utilities
export { performDirectSpawnTest, USER_SPECIFIED_COLLISION_PATH } from "./ball/ball-test-utils";
export type { TestSpawnConfig, TestSpawnDetails } from "./ball/ball-test-utils";

// Display components
export { default as MultiplierDisplay } from "./display/MultiplierDisplay";
export { default as PayoutsDisplay } from "./display/PayoutsDisplay";
export { default as PayoutsRow } from "./display/PayoutsRow";
export { default as ValueDisplay } from "./display/ValueDisplay";

// Layout components
export { default as GameBackground } from "./layout/GameBackground";

// Re-export physics utilities from lib
export * from "../../../lib/physics";
