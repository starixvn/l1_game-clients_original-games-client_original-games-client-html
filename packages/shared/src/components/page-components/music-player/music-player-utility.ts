type ControlMusicMeta = { audioContext: AudioContext; isPlaying: boolean; play: Function; pause?: Function };
export const controlMusic = ({ audioContext, isPlaying, play, pause }: ControlMusicMeta) => {
    if (!audioContext) {
        return;
    }

    const playMusic = () => {
        if (typeof play !== "function") {
            return;
        }

        if (audioContext?.state === "suspended") {
            setTimeout(() => {
                audioContext
                    .resume()
                    .then(() => {
                        play();
                    })
                    .catch(() => {
                        play();
                    });
            }, 500); // Wait a little bit to update audio context state on Safari
        } else {
            play();
        }
    };

    const pauseMusic = () => {
        if (typeof pause !== "function") {
            return;
        }

        if (document.visibilityState === "visible") {
            pause();
        } else {
            audioContext?.state !== "suspended" &&
                audioContext
                    .suspend()
                    .then(() => {
                        pause();
                    })
                    .catch(() => {
                        pause();
                    });
        }
    };

    isPlaying ? playMusic() : pauseMusic();
};
