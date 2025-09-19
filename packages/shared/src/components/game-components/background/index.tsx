import { memo } from "react";
import { buildVersion } from '@shared/constants';
import styles from "./style.module.scss";
import Image from "next/image";
import dynamic from "next/dynamic";
const ConfettiEffect = dynamic(() => import("../balance-effect/confetti-effect"), { ssr: false });

type Props = {
    gameId: number;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const Background: React.FC<Props> = ({ gameId }) => {
    return (
        <>
            <Image src={`${basePath}/static/images/background/bg-${gameId}.webp?v=${buildVersion}`} alt="Background" fill className={`${styles["game-background"]} md:left-0 md:w-full md:rounded-t-xl`} />
            <ConfettiEffect />
        </>
    );
};

export default memo(Background);
