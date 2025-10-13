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
}

export interface PegBody extends Body {
    index?: string;
    rowIndex?: number;
    circleRadius?: number;
    side?: string;
}

export interface PegEffect {
    x: number;
    y: number;
    radius: number;
    color: string;
    borderRadius: number;
    borderColor: string;
    speed: number;
    maxSpeed: number;
}
