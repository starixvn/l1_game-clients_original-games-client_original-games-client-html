import { create } from 'zustand';
import { createThemeSlice, ThemeSlice } from '../theme-slice';
import { Themes } from '../../../constants';

describe('ThemeSlice', () => {
    let useTestStore: any;

    beforeEach(() => {
        useTestStore = create<ThemeSlice>()((...args) => ({
            ...createThemeSlice(...args),
        }));
    });

    it('should initialize with default dark theme', () => {
        const { currentTheme, isDark } = useTestStore.getState();
        expect(currentTheme).toBe(Themes.dark);
        expect(isDark).toBe(true);
    });

    describe('setTheme', () => {
        it('should set theme to light and update isDark to false', () => {
            const { setTheme } = useTestStore.getState();

            setTheme(Themes.light);

            const { currentTheme, isDark } = useTestStore.getState();
            expect(currentTheme).toBe(Themes.light);
            expect(isDark).toBe(false);
        });

        it('should set theme to dark and update isDark to true', () => {
            const { setTheme } = useTestStore.getState();

            // First set to light
            setTheme(Themes.light);
            expect(useTestStore.getState().isDark).toBe(false);

            // Then set back to dark
            setTheme(Themes.dark);

            const { currentTheme, isDark } = useTestStore.getState();
            expect(currentTheme).toBe(Themes.dark);
            expect(isDark).toBe(true);
        });

        it('should not change theme for invalid theme values', () => {
            const { setTheme } = useTestStore.getState();
            const originalState = useTestStore.getState();

            setTheme('invalid-theme');

            const newState = useTestStore.getState();
            expect(newState.currentTheme).toBe(originalState.currentTheme);
            expect(newState.isDark).toBe(originalState.isDark);
        });

        it('should not change theme for number-game theme', () => {
            const { setTheme } = useTestStore.getState();
            const originalState = useTestStore.getState();

            setTheme(Themes.numberGame);

            const newState = useTestStore.getState();
            expect(newState.currentTheme).toBe(originalState.currentTheme);
            expect(newState.isDark).toBe(originalState.isDark);
        });
    });

    describe('toggleTheme', () => {
        it('should toggle from dark to light', () => {
            const { toggleTheme } = useTestStore.getState();

            // Initial state is dark
            expect(useTestStore.getState().currentTheme).toBe(Themes.dark);
            expect(useTestStore.getState().isDark).toBe(true);

            toggleTheme();

            const { currentTheme, isDark } = useTestStore.getState();
            expect(currentTheme).toBe(Themes.light);
            expect(isDark).toBe(false);
        });

        it('should toggle from light to dark', () => {
            const { setTheme, toggleTheme } = useTestStore.getState();

            // Set to light first
            setTheme(Themes.light);
            expect(useTestStore.getState().currentTheme).toBe(Themes.light);
            expect(useTestStore.getState().isDark).toBe(false);

            toggleTheme();

            const { currentTheme, isDark } = useTestStore.getState();
            expect(currentTheme).toBe(Themes.dark);
            expect(isDark).toBe(true);
        });

        it('should handle multiple toggles', () => {
            const { toggleTheme } = useTestStore.getState();

            // Start: dark -> light
            toggleTheme();
            expect(useTestStore.getState().currentTheme).toBe(Themes.light);

            // light -> dark
            toggleTheme();
            expect(useTestStore.getState().currentTheme).toBe(Themes.dark);

            // dark -> light
            toggleTheme();
            expect(useTestStore.getState().currentTheme).toBe(Themes.light);
        });
    });

    describe('theme state consistency', () => {
        it('should maintain consistent isDark value with currentTheme', () => {
            const { setTheme } = useTestStore.getState();

            setTheme(Themes.light);
            expect(useTestStore.getState().isDark).toBe(false);

            setTheme(Themes.dark);
            expect(useTestStore.getState().isDark).toBe(true);
        });
    });
});
