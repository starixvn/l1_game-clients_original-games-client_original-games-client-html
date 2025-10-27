import { buildVersion } from "@shared/constants";
import { objectMap } from "@shared/helpers";
import { path, usePlaySound } from "@shared/react-hooks";

const mp3File = {
    plinkoBallHitPin: `ball-hit-pin`,
    plinkoBallHitWin: `ball-hit-win`,
};

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}.mp3?v=${buildVersion}`);

export const usePlinkoBallHitPinSound = () => {
    return usePlaySound(resourceMp3.plinkoBallHitPin);
};

export const usePlinkoBallHitWinSound = () => {
    return usePlaySound(resourceMp3.plinkoBallHitWin);
};
