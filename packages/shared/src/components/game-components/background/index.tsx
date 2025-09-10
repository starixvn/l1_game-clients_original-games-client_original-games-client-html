import { memo } from "react";
import { buildVersion } from '@shared/constants';
import styles from "./style.module.scss";
import dynamic from "next/dynamic";
import Image from "next/image";

type Props = {
    gameId: number;
};

const WinningBalanceEffect = dynamic(() => import("../balance-effect/winning-balance-effect"), { ssr: false });

export const Background: React.FC<Props> = ({ gameId }) => {
    return (
        <>
            <Image src={`/static/images/background/bg-${gameId}.webp?v=${buildVersion}`} alt="Background" fill className={`${styles["game-background"]} md:left-0 md:w-full md:rounded-t-xl`} />

            <WinningBalanceEffect />
        </>
    );
};

export default memo(Background);
