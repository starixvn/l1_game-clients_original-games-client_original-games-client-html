import { IPlinkoCanvasConfig } from "./type";
import { CANVAS_CONSTANTS, PEG_CONSTANTS } from "../constants/scaling-constants";

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
        radius: 11,
        offsetVelocityX: 1.25,
        offsetVelocityY: -1.35,
    },
} as const;
