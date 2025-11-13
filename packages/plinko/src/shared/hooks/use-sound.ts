import { buildVersion } from "@shared/constants";
import { formatVolume, objectMap } from "@shared/helpers";
import { path, usePlaySound } from "@shared/react-hooks";
import { useSettingStore } from "@shared/stores/setting-store";
import { useEffect } from "react";
import useSound from "use-sound";
import { useShallow } from "zustand/shallow";
import { usePlinkoGameStore } from "../stores";

const mp3File = {
    plinkoBallHitPinHigh: `ball-hit-pin-high`,
    plinkoBallHitPinMedium: `ball-hit-pin-medium`,
    plinkoBallHitPinLow: `ball-hit-pin-low`,
};
const plinkoBallHitWin = `${path}ball-hit-win.mp3?v=${buildVersion}`;

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}.mp3?v=${buildVersion}`);

export const usePlinkoBallHitPinSound = () => {
    const randomResourceMp3 = getRandomResourceMp3();
    const [play, { sound: ctx }] = useSound(randomResourceMp3, {
        interrupt: false,
    });

    const canPlayHit = useSettingStore(useShallow((state) => state.canPlayHit));
    const updateHitTime = useSettingStore(useShallow((state) => state.updateHitTime));
    const numberOfDroppingBall = usePlinkoGameStore(useShallow((state) => state.numberOfDroppingBall));

    const { volumeSFX, enabledSound } = useSettingStore(useShallow((state) => ({
        volumeSFX: state.volumeSFX,
        enabledSound: state.enabledSound,
    })));    
 
    const playPlinkoBallHitPinSound = () => {
        if (canPlayHit() && enabledSound && volumeSFX > 0 && numberOfDroppingBall > 0) {
            play();
            updateHitTime();
        }
    };

    useEffect(() => {
        if (ctx) {  
            ctx.volume(formatVolume(volumeSFX));
        }
    }, [volumeSFX]);

    return playPlinkoBallHitPinSound;
};

const getRandomResourceMp3 = () => {
    const random = Math.random();
    if (random < 0.33) {
        return resourceMp3.plinkoBallHitPinHigh;
    } else if (random < 0.66) {
        return resourceMp3.plinkoBallHitPinMedium;
    } else {
        return resourceMp3.plinkoBallHitPinLow;
    }
};

export const usePlinkoBallHitWinSound = () => {
    return usePlaySound(plinkoBallHitWin);
};
