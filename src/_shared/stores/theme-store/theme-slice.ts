import { StateCreator } from "zustand";
import { Themes } from "../../constants";

export interface ThemeSlice {
    currentTheme: string;
    isDark: boolean;
    
    // Actions
    setTheme: (theme: string) => void;
    toggleTheme: () => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set, get) => ({
    currentTheme: Themes.dark,
    isDark: true,

    setTheme: (theme: string) => {
        if (theme === Themes.light || theme === Themes.dark) {
            set({ 
                currentTheme: theme, 
                isDark: theme === Themes.dark 
            });
        }
    },

    toggleTheme: () => {
        const { currentTheme } = get();
        const newTheme = currentTheme === Themes.light ? Themes.dark : Themes.light;
        get().setTheme(newTheme);
    },
});
