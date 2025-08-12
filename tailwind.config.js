/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
    darkMode: "class",
    theme: {
        spacing: {
            1: "4px",
            2: "8px",
            3: "12px",
            4: "16px",
            5: "20px",
            6: "24px",
        },
        extend: {
            colors: {
                primary: "var(--page-background-color)",
                text: "var(--text-color)",
                border: "var(--border-color)",
                popup: "var(--popup-background)",
                "popup-text": "var(--popup-color)",
                container: "var(--container-color-bg)",
                "container-border": "var(--container-border-color)",
                opacity: "var(--opacity-background)",
                "opacity-grey": "var(--opacity-background-grey)",
                scrollbar: "var(--scrollbar-background)",
                "scrollbar-thumb": "var(--scrollbar-thumb-background)",
                "icon-guide": "var(--icon-favorite-game-guide)",
            },
        },
    },
    plugins: [],
};
