
export const getSubDomain = (url: string) => {
    try {
        return /http(s?):\/\/([^\/]+)/.exec(url)[0];
    } catch (e) {
        return "";
    }
};