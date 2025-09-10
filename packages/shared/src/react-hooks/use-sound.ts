import useSound from "use-sound";
import { buildVersion } from "../constants";
import { StorageHelper, formatVolume, localStorageKeys, objectMap } from "../helpers";
import { useSettingContext } from "../react-contexts";
export const path = "./static/sounds/";

const mp3File = {
    placeBet: `place-bet`,
    click: `click`,
    selectChip: `select-chip`,
    startingRound: `starting-round`,
    startingDraw: `starting-draw`,
    showBallResult: `show-ball-result`,
    blockBet: `block-bet`,
};

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}.mp3?v=${buildVersion}`);

export const usePlaySound = (resource: string) => {
    const [playSound, { sound: ctx }] = useSound(resource, {});
    const settingContext = useSettingContext();

    return () => {
        if (document.visibilityState === "visible" && ctx) {
            const enable = StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true;
            ctx.volume(formatVolume(settingContext.volumeSFX));
            settingContext.volumeSFX && enable && playSound();
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
