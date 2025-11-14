import { buildVersion } from "@shared/constants";
import { formatVolume, objectMap } from "@shared/helpers";
import { path, usePlaySound } from "@shared/react-hooks";
import { useSettingStore } from "@shared/stores/setting-store";
import { useEffect } from "react";
import useSound from "use-sound";
import { useShallow } from "zustand/shallow";
import { usePlinkoGameStore } from "../stores";

const mp3File = {
    plinkoBallHitPin: `ball-hit-pin`,
};

const plinkoBallHitWin = `${path}ball-hit-win.mp3?v=${buildVersion}`;

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}.mp3?v=${buildVersion}`);

export const usePlinkoBallHitPinSound = () => {
    const [play, { sound: ctx }] = useSound(resourceMp3.plinkoBallHitPin, {
        interrupt: false,
    });

    const numberOfDroppingBall = usePlinkoGameStore(useShallow((state) => state.numberOfDroppingBall));

    const { volumeSFX, enabledSound } = useSettingStore(
        useShallow((state) => ({
            volumeSFX: state.volumeSFX,
            enabledSound: state.enabledSound,
        }))
    );

    const playPlinkoBallHitPinSound = () => {
        if (enabledSound && volumeSFX > 0 && numberOfDroppingBall > 0) {
           play();
        }
    };

    useEffect(() => {
        if (ctx) {  
            ctx.volume(formatVolume(volumeSFX));
        }
    }, [volumeSFX]);

    return playPlinkoBallHitPinSound;
};

export const usePlinkoBallHitWinSound = () => {
    return usePlaySound(plinkoBallHitWin);
};
