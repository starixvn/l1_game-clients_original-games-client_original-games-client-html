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

export interface ExplosionEffect {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    opacity: number;
    speed: number;
    columnWidth?: number; // Width of light column
    gradient?: boolean; // Enable gradient effect
    initialOpacity?: number; // Track initial opacity
    fadeSpeed?: number; // How fast opacity decreases
    phase?: "impact" | "explosion"; // Animation phase
    vx?: number; // Horizontal velocity for explosion particles
    vy?: number; // Vertical velocity for explosion particles
}
