import { buildVersion } from "../constants";
import { path as soundsPath } from "./use-sound";

const path = `${soundsPath}bg-music/`;

const initSongs = (n): number[] => {
    const songs: number[] = [];
    for (let i = 1; i <= n; i++) {
        songs.push(i);
    }
    return songs;
};

export const songList = initSongs(4).map((x) => `${path}song${x}.mp3?v=${buildVersion}`);

export const getRandomSong = (currentSong: string) => {
    const newSongList = songList.filter((s) => s !== currentSong);
    const randomSongIndex = Math.floor(Math.random() * newSongList.length);
    return newSongList[randomSongIndex];
};
