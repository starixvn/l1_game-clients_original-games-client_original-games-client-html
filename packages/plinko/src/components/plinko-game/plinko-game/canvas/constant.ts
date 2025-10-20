import { IPlinkoCanvasConfig } from "./type";
import { CANVAS_CONSTANTS, PEG_CONSTANTS } from "../constants/scaling-constants";
import { IBodyDefinition } from "matter-js";

export const PLINKO_OBJECTS = {
    BALL: "ball",
    PEG: "peg",
    SLOT: "slot",
} as const;

export const PlinkoCanvasConfig: IPlinkoCanvasConfig = {
    width: CANVAS_CONSTANTS.ORIGINAL_WIDTH,
    height: 1000,
    pegRadius: PEG_CONSTANTS.RADIUS,
    mapGap: PEG_CONSTANTS.MAP_GAP,
    ballConfig: {
        radius: 14,
        offsetVelocityX: 1,
        offsetVelocityY: 0,
    },
} as const;

export const BALL_BODY_OPTIONS: IBodyDefinition = {
    restitution: 0,
    friction: 0,
    frictionAir: 0.05,
    collisionFilter: {
        group: -1,
    },
};
