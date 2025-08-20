import { memo } from "react";
import { buildVersion } from "../../../_shared/constants";
import styles from "./style.module.scss";

type Props = {
    gameId: number;
};

export const Background: React.FC<Props> = ({ gameId }) => {
    return (
        <div
            className={styles["game-background"]}
            style={{ backgroundImage: `url(/static/images/background/bg-${gameId}.webp?v=${buildVersion})` }}
        ></div>
    );
};

export default memo(Background);
