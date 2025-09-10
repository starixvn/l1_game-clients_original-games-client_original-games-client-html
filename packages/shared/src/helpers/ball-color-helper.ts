enum BallColor {
    BLUE = "blue",
    RED = "red",
}

export const getBallColor = (index: number) => {
    return index % 2 === 0 ? BallColor.RED : BallColor.BLUE;
};
