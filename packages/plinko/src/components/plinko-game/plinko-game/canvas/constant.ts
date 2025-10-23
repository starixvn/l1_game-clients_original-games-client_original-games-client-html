import { IPlinkoCanvasConfig } from "./type";
import { IBodyDefinition } from "matter-js";

export const PLINKO_OBJECTS = {
    BALL: "ball",
    PEG: "peg",
    SLOT: "slot",
} as const;

export const PlinkoCanvasConfig: IPlinkoCanvasConfig = {
    width: 1050,
    height: 1000,
    pegRadius: 7.5,
    mapGap: 3.6,
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
