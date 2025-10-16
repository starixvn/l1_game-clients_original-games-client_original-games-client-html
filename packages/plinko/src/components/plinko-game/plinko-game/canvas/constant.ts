import { IPlinkoCanvasConfig } from "./type";

export const PLINKO_OBJECTS = {
    BALL: "ball",
    PEG: "peg",
    SLOT: "slot",
};

export const PlinkoCanvasConfig: IPlinkoCanvasConfig = {
    width: 1050,
    height: 1000,
    pegRadius: 8.5,
    mapGap: 3.4,
    ballConfig: {
        radius: 11,
        offsetVelocityX: 1.25,
        offsetVelocityY: -1.35,
    },
};
