import { useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store/theme-store';
import { Themes } from '../constants';

export const useAppTheme = () => {
    const { currentTheme, isDark, setTheme, toggleTheme } = useThemeStore();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && (savedTheme === Themes.light || savedTheme === Themes.dark)) {
                setTheme(savedTheme);
            } else {
                document.documentElement.style.colorScheme = Themes.dark;
            }
        }
    }, [setTheme]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', currentTheme);
            document.documentElement.style.colorScheme = currentTheme;
            
            localStorage.setItem('theme', currentTheme);
        }
    }, [currentTheme]);

    const handleSetTheme = (theme: string) => {
        setTheme(theme);
    };

    return {
        currentTheme,
        isDark,
        setTheme: handleSetTheme,
        toggleTheme,
    };
};
