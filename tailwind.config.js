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
                "table-header": "var(--table-header)",
                "bet-detail-row-1": "var(--bet-detail-row-1)",
                "bet-detail-row-2": "var(--bet-detail-row-2)",
                "modal-text": "var(--modal-text-color)",
                "modal-bg": "#242C32",
                "modal-border": "var(--error-message-container-border)",
                "modal-color": "var(--error-message-container-color)",
                "icon-close": "#ea1d41",
                "modal-border-color": "#8E8E8E",
                "btn-green-hover": "#0e7029",
            },
            backgroundImage: {
                "popup-gradient": "var(--popup-background)",
                "modal-yellow-bg": "radial-gradient(circle, rgba(255, 239, 0, 0.2) -50%, rgba(255, 239, 0, 0) 70%)",
                "modal-red-bg": "radial-gradient(circle, rgba(240, 66, 72, 0.2) 0%, rgba(240, 66, 72, 0.1) 30%, rgba(240, 66, 72, 0) 100%)",
                "modal-gradient": "linear-gradient(121deg, #242C32 31.4%, #333D45 97.8%)",
                "success-gradient": "linear-gradient(121deg, #00AC48 31.4%, #26D45A 97.8%)",
                "warning-gradient": "linear-gradient(121deg, #DFB513 31.4%, #CA9C08 97.8%)",
                "btn-green": "linear-gradient(90deg, #00AC48 0%, #26D45A 100%)",
                "btn-gray": "linear-gradient(90deg, #455F84 0%, #5B769D 100%)"
            },
            boxShadow: {
                "popup-bet-form": "var(--popup-bet-form-shadow)",
                "modal": "0 0 10px 1px rgba(0, 0, 0, 0.60), 0 0 30px 3px rgba(0, 0, 0, 0.80)",
            },
            animation: {
                'spin-slow': 'spin 6s linear infinite',
                'spin-slow-reverse': 'spin 6s linear infinite reverse',
            },
            zIndex: {
                'modal': '300',
            },
        },
    },
    plugins: [],
};
