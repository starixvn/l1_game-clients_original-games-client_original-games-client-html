import { useEffect, useState } from "react";
import useSound from "use-sound";
import { formatVolume } from '@shared/helpers';
import { getRandomSong } from '@shared/react-hooks';
import { controlMusic } from "./music-player-utility";
import { useUserGesture } from "@shared/react-hooks/use-user-gesture";
import { useSettingStore } from "@shared/stores/setting-store";

const MusicPlayer = () => {
    const isUserGesture = useUserGesture();
    const [song, setSong] = useState(getRandomSong(""));

    const { enabledMusic, volumeMusic } = useSettingStore();
    const [play, { stop, pause, sound: ctx }] = useSound(song, {
        interrupt: false,
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        if (ctx) {
            enabledMusic && volumeMusic > 0 && play();
            ctx.volume(formatVolume(volumeMusic));
        }

        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        if (ctx) {
            const audioContext: AudioContext = (ctx as any)?._sounds[0]._node.context;
            const isPlaying = isUserGesture && enabledMusic && volumeMusic > 0;
            controlMusic({ audioContext, isPlaying, play, pause });
        }
    }, [ctx, isUserGesture, enabledMusic]);

    useEffect(() => {
        if (!ctx) {
            return;
        }
        ctx.volume(formatVolume(volumeMusic));
        const isBGMOn = +volumeMusic > 0;
        if (isBGMOn) {
            const sounds = (ctx as any)._sounds;
            const latestSound = sounds[sounds.length - 1];
            const isLatestSongPaused = latestSound._paused;
            if (isLatestSongPaused) {
                const audioContext: AudioContext = latestSound._node.context;
                controlMusic({ audioContext, isPlaying: true, play, pause: () => {} });
            }
        }
    }, [volumeMusic]);

    return <></>;
};

export default MusicPlayer;
