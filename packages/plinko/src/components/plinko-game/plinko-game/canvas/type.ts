import { Body } from "matter-js";
import { PlinkoFinish } from "@plinko/shared/types/types";

export interface IPlinkoCanvasConfig {
    width: number;
    height: number;
    pegRadius: number;
    mapGap: number;
    ballConfig: BallConfig;
}

interface BallConfig {
    radius: number;
    offsetVelocityX: number;
    offsetVelocityY: number;
}

export interface BallBody extends Body {
    index?: string;
    finish?: PlinkoFinish;
    collidedRowIndexes?: number[];
    slotIndex?: number;
}

export interface PegBody extends Body {
    index?: string;
    rowIndex?: number;
    circleRadius?: number;
    side?: string;
}

export interface SlotBody extends Body {
    slotIndex?: number;
}

export interface PegEffect {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    opacity: number;
    speed: number;
}

export interface GlowParticle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    radius: number;
    baseRadius: number;
    color: string;
    alpha: number;
    baseAlpha: number;
    pulseSpeed: number;
    pulsePhase: number;
    // Ellipse path parameters
    ellipseAngle: number; // Current angle on ellipse (0 to 2π)
    ellipseSpeed: number; // Speed of movement along ellipse
    ellipseA: number; // Semi-major axis (horizontal radius)
    ellipseB: number; // Semi-minor axis (vertical radius)
    ellipseRotation: number; // Rotation of ellipse in radians
    // Legacy drift properties (kept for backward compatibility)
    driftX: number;
    driftY: number;
    driftSpeed: number;
    maxDrift: number;
}

export interface PositionConfig {
    x: number;
    y: number;
    particleCount?: number; // Số lượng particles cho position này
    driftSpeed?: number; // Tốc độ drift cho position này
    maxDrift?: number; // Khoảng cách tối đa cho position này
    ellipseOrientation?: 'horizontal' | 'vertical' | 'random';
    ellipseA?: number; // Override cho semi-major axis
    ellipseB?: number; // Override cho semi-minor axis
}

export interface GlowParticleConfig {
    positions: Array<PositionConfig | { x: number; y: number }>; // Hỗ trợ cả cũ và mới
    particleCount: number; // Default cho tất cả positions
    baseRadius: number;
    baseAlpha: number;
    colors: string[];
    pulseSpeed: number;
    driftSpeed: number; // Default cho tất cả positions
    maxDrift: number; // Default cho tất cả positions
}
