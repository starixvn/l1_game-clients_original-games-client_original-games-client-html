export const formatPlinkoOdds = (odds: number) => {
    if (odds == null || isNaN(odds)) {
        return "-";
    }

    if (odds >= 1000) {
        const value = odds / 1000;
        return `${Math.floor(value * 100) / 100}K`;
    }

    const str = odds.toString();

    if (str.length <= 4) {
        return str;
    }

    if (str.includes(".")) {
        const [intPart, decimalPart] = str.split(".");
        const remain = 4 - intPart.length - 1;
        if (remain <= 0) {
            return intPart;
        }

        const truncated = `${intPart}.${decimalPart.slice(0, remain)}`;
        const num = parseFloat(truncated);
        if (Number.isInteger(num)) {
            return num.toString();
        }
        return num.toString();
    }

    return str;
};