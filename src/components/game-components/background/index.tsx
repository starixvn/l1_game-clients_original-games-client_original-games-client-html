import { memo } from "react";
import { buildVersion } from "../../../_shared/constants";
import styles from "./style.module.scss";
import ReactCanvasConfetti from "react-canvas-confetti";
import dynamic from "next/dynamic";

type Props = {
    gameId: number;
};

const WinningBalanceEffect = dynamic(() => import("../balance-effect/winning-balance-effect"));


export const Background: React.FC<Props> = ({ gameId }) => {
    return (
        <>
            <div
                className={`${styles["game-background"]} md:left-0 md:w-full md:rounded-t-xl`}
                style={{ backgroundImage: `url(/static/images/background/bg-${gameId}.webp?v=${buildVersion})` }}
            ></div>
            
            <WinningBalanceEffect />
        </>
    );
};

export default memo(Background);
