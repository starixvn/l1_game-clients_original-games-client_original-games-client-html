interface String {
    replaceTolgeeFormat(): string;
    capitalizeFirstLetter(): string;
    appendBuildVersion(): string;
    removeBuildVersion(): string;
}

String.prototype.replaceTolgeeFormat = function () {
    return this.replaceAll("%", "").replaceAll("(%", "(").replaceAll("#%", "#");
};
String.prototype.capitalizeFirstLetter = function () {
    const regex = /(^|\s)[a-z]/g;
    return this.toLowerCase().replace(regex, (letter) => letter.toUpperCase());
};

String.prototype.appendBuildVersion = function () {
    return `${this}?v=${process?.env?.buildVersion || 111}`;
};

String.prototype.removeBuildVersion = function () {
    return this.replace(/\?v=[a-zA-Z0-9]*/, "");
};
