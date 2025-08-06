import { buildVersion } from "../../../_shared/constants";
import Styles from "./avatar.module.scss";

export type AvatarProps = {
    imgId: number;
    selected: boolean;
    onSelect: () => void;
};

export const Avatar: React.FC<AvatarProps> = ({ imgId, selected, onSelect }) => {
    console.log("[Avatar] rendering avatar with imgId:", imgId, "selected:", selected);

    const handleClick = () => {
        console.log("[Avatar] avatar clicked, imgId:", imgId);
        onSelect();
    };

    return (
        <div
            className={`${Styles.avatar} ${selected ? Styles.selected : ""}`}
            onClick={handleClick}
        >
            <img
                src={`/static/images/avatars/avatar-${imgId}.png?v=${buildVersion}`}
                alt={`Avatar ${imgId}`}
            />
        </div>
    );
};
