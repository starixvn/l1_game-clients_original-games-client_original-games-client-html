export function toFlattenColumns<T>(rows: T[][]): T[] {


    const result = {};

    rows.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
            if (result[columnIndex]) {
                result[columnIndex][rowIndex] = cell;
            } else {
                result[columnIndex] = { [rowIndex]: cell };
            }
        });
    });

    const flattened = Object.values(result).flatMap((data) => Object.values(data));



    return flattened;
}

export function chunk<T>(array: T[], size: number): T[][] {


    const result = [];

    for (let i = 0; i < array.length; i += size) {
        const chunk = array.slice(i, i + size);
        result.push(chunk);
    }



    return result;
}

export function fitContent<T>(rounds: T[], capacity: number, addition: T) {


    if (rounds.length > capacity) {
        const trimmed = rounds.slice(rounds.length - capacity);

        return trimmed;
    }

    const additions = Array.from({ length: capacity - rounds.length }, (_) => addition);
    const padded = [...rounds, ...additions];



    return padded;
}
