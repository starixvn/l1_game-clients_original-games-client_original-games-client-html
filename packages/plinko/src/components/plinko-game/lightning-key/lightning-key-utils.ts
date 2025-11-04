export const generateRandomLightningKey = (maxLength = 8): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomStringLength = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (2 ** 32) * maxLength) + 1;

    const randomValues = new Uint32Array(randomStringLength);
    crypto.getRandomValues(randomValues);

    let randomString = '';
    for (let i = 0; i < randomStringLength; i++) {
        randomString += characters.charAt(randomValues[i] % characters.length);
    }

    return randomString;
};

export const filterLightningKeyInput = (value: string, maxLength = 8): string => {
    return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, maxLength);
};
