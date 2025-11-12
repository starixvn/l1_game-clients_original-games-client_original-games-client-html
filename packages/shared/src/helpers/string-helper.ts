declare global {
    interface String {
        replaceTolgeeFormat(): string;
        capitalizeFirstLetter(): string;
        appendBuildVersion(): string;
        removeBuildVersion(): string;
    }
}

String.prototype.replaceTolgeeFormat = function () {
    return this.replaceAll("%", "").replaceAll("(%", "(").replaceAll("#%", "#");
};
String.prototype.capitalizeFirstLetter = function () {
    return this.split(/\s+/)
        .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase())
        .join(" ");
};

String.prototype.appendBuildVersion = function () {
    return `${this}?v=${process?.env?.buildVersion || 111}`;
};

String.prototype.removeBuildVersion = function () {
    return this.replace(/\?v=[a-zA-Z0-9]*/, "");
};

export const capitalizeFirstLetter = (str: string) => {
    return str.capitalizeFirstLetter();
};
