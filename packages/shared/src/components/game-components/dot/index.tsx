import Style from "./dot.module.scss";

const DotColorMapper = {
  red4: [true, true, true, true],
  red3blue1: [true, true, true, false],
  red2blue2: [true, true, false, false],
  red1blue3: [true, false, false, false],
  blue4: [false, false, false, false],
  red3: [true, true, true],
  red2blue1: [true, true, false],
  red1blue2: [true, false, false],
  blue3: [false, false, false],
};

const RoundDot = (props: any) => {
  const { color } = props;
  const classDotName = `dot-${color}`;
  return <div className={Style[classDotName]}></div>;
};

const renderDots = (dots: boolean[]) => {
  return dots.map((isRed, index) => {
    return <RoundDot key={index} color={isRed ? "red" : "blue"} />;
  });
};

const renderIcons = (choice: string) => {
  return renderDots(DotColorMapper[choice]);
};

export const Dot: React.FC<{ choice: string }> = ({ choice }) => {
  return (
    <div
      className={`${Style["dot-wrapper"]} ${
        choice === "red2blue2" ? Style["two-lines"] : ""
      }`}
    >
      {renderIcons(choice)}
    </div>
  );
};
export default Dot;
