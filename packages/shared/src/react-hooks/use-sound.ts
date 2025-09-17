import useSound from "use-sound";
import { buildVersion } from "../constants";
import { StorageHelper, formatVolume, localStorageKeys, objectMap } from "../helpers";
import { useSettingStore } from "@shared/stores/setting-store";
import { useUserGesture } from "./use-user-gesture";
import { useShallow } from "zustand/react/shallow";
export const path = "./static/sounds/";

const mp3File = {
    placeBet: `place-bet`,
    click: `click`,
    selectChip: `select-chip`,
    startingRound: `starting-round`,
    startingDraw: `starting-draw`,
    showBallResult: `show-ball-result`,
    blockBet: `block-bet`,
    popUpWinning: `pop-up-winning`,
    diceShakingRolling: `dice-shaking-rolling`,
};

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}.mp3?v=${buildVersion}`);

export const usePlaySound = (resource: string) => {
    const [playSound, { sound: ctx }] = useSound(resource, {});
    const { volumeSFX, enabledSound } = useSettingStore(useShallow((state) => ({
        volumeSFX: state.volumeSFX,
        enabledSound: state.enabledSound,
    })));
    
    const isUserGesture = useUserGesture();
    
    return () => {
        if (document.visibilityState === "visible" && ctx && isUserGesture) {
            const enable = enabledSound;
            ctx.volume(formatVolume(volumeSFX));
            if (volumeSFX && enable) {
                // Resume audio context if suspended
                const audioContext = (ctx as any)?._sounds?.[0]?._node?.context;
                if (audioContext?.state === "suspended") {
                    audioContext.resume().then(() => {
                        playSound();
                    }).catch(() => {
                        playSound();
                    });
                } else {
                    playSound();
                }
            }
        }
    };
};

export const useClickSound = () => {
    return usePlaySound(resourceMp3.click);
};

export const useSelectChipSound = () => {
    return usePlaySound(resourceMp3.selectChip);
};

export const usePlaceBetSound = () => {
    return usePlaySound(resourceMp3.placeBet);
};

export const useStartDrawSound = () => {
    return usePlaySound(resourceMp3.startingDraw);
};

export const useStartRoundSound = () => {
    return usePlaySound(resourceMp3.startingRound);
};

export const useShowBallResultSound = () => {
    return usePlaySound(resourceMp3.showBallResult);
};

export const useBlockBetSound = () => {
    return usePlaySound(resourceMp3.blockBet);
};

export const usePopUpWinningSound = () => {
    return usePlaySound(resourceMp3.popUpWinning);
};

export const useDiceShakingRollingSound = () => {
    return usePlaySound(resourceMp3.diceShakingRolling);
};
