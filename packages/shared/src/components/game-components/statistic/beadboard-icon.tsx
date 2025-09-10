import { usePlayerContext } from "../../../_shared/react-contexts";
import { BeadBoardIconProps } from "./types";

const BeadBoardIcon: React.FC<BeadBoardIconProps> = ({ choice }) => {
    const { locale } = usePlayerContext();
    const iconClass = ["specific1", "specific2", "specific3", "specific4", "specific5", "specific6"].includes(choice)
        ? `icon-${choice}`
        : `icon-${choice}_${locale}`;

    if (!choice) {
        return null;
    }

    return (
        <span className={iconClass}>
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
        </span>
    );
};

export default BeadBoardIcon;
