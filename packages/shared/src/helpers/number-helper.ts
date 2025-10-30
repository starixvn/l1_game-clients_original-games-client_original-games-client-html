const numberRoundDownWithCommas = (number: number, toFixed = 2) => {
    const result = Math.floor(number * Math.pow(10, toFixed)) / Math.pow(10, toFixed);

    return numberWithCommas(result, toFixed);
};

const numberWithCommas = (number: number, toFixed = 2, minimumFractionDigits = 0) => {
    const options = { maximumFractionDigits: toFixed } as any;
    if (number % parseInt(number.toString()) !== 0) {
        options.minimumFractionDigits = minimumFractionDigits;
    }
    return number.toLocaleString("en-US", options);
};

const randomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomNumberSeries = (length: number) => {
    return Array.from({ length }, () => randomInteger(0, 9)).join("");
};

const sumArray = (numbers: number[]) => numbers.reduce((number, sum) => number + sum, 0);

const formatOdds = (value: number | string | undefined, isFractionalFormat = false, decimalPlaces = 2) => {
    return isFractionalFormat ? `${numberWithCommas(+value - 1, 2, decimalPlaces)}:1` : `1:${numberWithCommas(+value, 2, decimalPlaces)}`;
};

const initIntegerArray = (from: number, to: number) => {
    const integerArray = [];
    for (let i = from; i <= to; i++) {
        integerArray.push(i);
    }
    return integerArray;
};

const formatVolume = (value: number): number => {
    return +value / 100;
};

const calculateWinAmount = (isWin: boolean, amount: number, odds: number) => (isWin ? amount * odds : 0);

export {
    formatOdds,
    formatVolume,
    initIntegerArray,
    numberRoundDownWithCommas,
    numberWithCommas,
    randomInteger,
    randomNumberSeries,
    sumArray,
    calculateWinAmount,
};
