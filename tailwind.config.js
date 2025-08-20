/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
    darkMode: "class",
    important: true,
    theme: {
        extend: {
            colors: {
                "primary-bg": "var(--primary-background-color)",
                "primary-text": "var(--text-color)",
                "primary-border": "var(--border-color)",
                "secondary-bg": "var(--secondary-background-color)",
                "secondary-text": "var(--secondary-text-color)",
                "popup-bg": "var(--popup-background)",
                "popup-text": "var(--popup-color)",
                "container-bg": "var(--container-color-bg)",
                "container-border": "var(--container-border-color)",
                "opacity-bg": "var(--opacity-background)",
                "opacity-grey": "var(--opacity-background-grey)",
                "scrollbar-bg": "var(--scrollbar-background)",
                "scrollbar-thumb": "var(--scrollbar-thumb-background)",
                "icon-guide": "var(--icon-favorite-game-guide)",
                "table-text-clickable": "var(--color-table-text-clickable)",
                "winning-highlight": "var(--color-winning-highlight)",
            },
            backgroundImage: {
                "popup-gradient": "var(--popup-background)",
              },
              boxShadow: {
                "popup-bet-form": "var(--popup-bet-form-shadow)",
              },
        },
    },
    plugins: [],
};
