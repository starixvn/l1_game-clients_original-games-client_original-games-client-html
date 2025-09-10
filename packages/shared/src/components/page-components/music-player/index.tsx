import { useEffect, useState } from "react";
import useSound from "use-sound";
import { formatVolume } from '@shared/merged/_shared/helpers';
import { useSettingContext } from '@shared/merged/_shared/react-contexts';
import { getRandomSong } from '@shared/merged/_shared/react-hooks';
import { controlMusic } from "./music-player-utility";
import { addMultipleEventListeners } from '@shared/merged/_shared/helpers/event-listener-helper';

const MusicPlayer = () => {
    const [isUserGesture, setIsUserGesture] = useState(null);
    const [song, setSong] = useState(getRandomSong(""));

    const settingContext = useSettingContext();
    const [play, { stop, pause, sound: ctx }] = useSound(song, {
        interrupt: false,
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        if (ctx) {
            settingContext.enabledMusic && settingContext.volumeMusic > 0 && play();
            ctx.volume(formatVolume(settingContext.volumeMusic));
        }

        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        if (ctx) {
            const audioContext: AudioContext = (ctx as any)?._sounds[0]._node.context;
            const isPlaying = isUserGesture && settingContext.enabledMusic && settingContext.volumeMusic > 0;
            controlMusic({ audioContext, isPlaying, play, pause });
        }
    }, [ctx, isUserGesture, settingContext.enabledMusic]);

    useEffect(() => {
        if (!ctx) {
            return;
        }
        ctx.volume(formatVolume(settingContext.volumeMusic));
        const isBGMOn = +settingContext.volumeMusic > 0;
        if (isBGMOn) {
            const sounds = (ctx as any)._sounds;
            const latestSound = sounds[sounds.length - 1];
            const isLatestSongPaused = latestSound._paused;
            if (isLatestSongPaused) {
                const audioContext: AudioContext = latestSound._node.context;
                controlMusic({ audioContext, isPlaying: true, play, pause: () => {} });
            }
        }
    }, [settingContext.volumeMusic]);

    useEffect(() => {
        const onChangeGesture = () => {
            setIsUserGesture(!document.hidden);
        };

        const onAllowGesture = () => {
            setIsUserGesture(true);
        };

        const events = ["scroll", "touchstart", "click"];
        const removeEventListeners = addMultipleEventListeners(document, events, onAllowGesture, { passive: true });

        document.addEventListener("visibilitychange", onChangeGesture);

        return removeEventListeners;
    }, []);

    return <></>;
};

export default MusicPlayer;
