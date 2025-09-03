import { create } from "zustand";
import { ThemeSlice, createThemeSlice } from "./theme-slice";

export type ThemeStore = ThemeSlice;

export const useThemeStore = create<ThemeStore>()((set, ...args) => {
    const themeSlice = createThemeSlice(set, ...args);

    return {
        ...themeSlice,
    };
});

export default useThemeStore;
