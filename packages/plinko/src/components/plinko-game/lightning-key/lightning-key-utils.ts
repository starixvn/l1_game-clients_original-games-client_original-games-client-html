export const generateRandomLightningKey = (maxLength = 8): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomStringLength = Math.floor(Math.random() * maxLength) + 1;
    let randomString = '';
    for (let i = 0; i < randomStringLength; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
};

export const filterLightningKeyInput = (value: string, maxLength = 8): string => {
    return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, maxLength);
};
