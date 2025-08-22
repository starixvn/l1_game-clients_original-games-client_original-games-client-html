import { create } from "zustand";
import { ThemeSlice, createThemeSlice } from "./theme-slice";

export type ThemeStore = ThemeSlice;

export const useThemeStore = create<ThemeStore>()((set, ...a) => {
    const themeSlice = createThemeSlice(set, ...a);

    return {
        ...themeSlice,
    };
});

export default useThemeStore;
