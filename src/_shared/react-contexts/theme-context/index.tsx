import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { Themes } from '../../constants';

interface ThemeContextType {
    currentTheme: string;
    toggleTheme: () => void;
    setTheme: (theme: string) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        return undefined;
    }
    return context;
};

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && theme) {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [mounted, theme]);

    useEffect(() => {
        if (mounted && router.isReady) {
            const { theme: urlTheme } = router.query;
            if (urlTheme && (urlTheme === Themes.light || urlTheme === Themes.dark)) {
                setTheme(urlTheme as string);
            } else if (!theme && !resolvedTheme) {
                setTheme(Themes.dark);
            }
        }
    }, [mounted, router.isReady, router.query, setTheme, theme, resolvedTheme]);

    const currentTheme = mounted ? (resolvedTheme || theme || Themes.dark) : Themes.dark;
    const isDark = currentTheme === Themes.dark;

    const toggleTheme = () => {
        const newTheme = currentTheme === Themes.light ? Themes.dark : Themes.light;
        setTheme(newTheme);
    };

    const handleSetTheme = (newTheme: string) => {
        setTheme(newTheme);
    };

    const value: ThemeContextType = {
        currentTheme,
        toggleTheme,
        setTheme: handleSetTheme,
        isDark,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
