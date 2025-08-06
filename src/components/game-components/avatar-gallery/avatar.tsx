import { buildVersion } from "../../../_shared/constants";
import Styles from "./avatar.module.scss";

export type AvatarProps = {
    imgId: number;
    selected: boolean;
    onSelect: () => void;
};

export const Avatar: React.FC<AvatarProps> = ({ imgId, selected, onSelect }) => {
    return (
        <div
            className={`${Styles.avatar} ${selected ? Styles.selected : ""}`}
            onClick={onSelect}
        >
            <img
                src={`/static/images/avatars/avatar-${imgId}.png?v=${buildVersion}`}
                alt={`Avatar ${imgId}`}
            />
        </div>
    );
};
