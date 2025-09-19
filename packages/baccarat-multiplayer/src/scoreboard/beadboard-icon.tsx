import { BeadBoardIconProps } from '@shared/components/game-components/statistic/types';
import styles from "./scoreboard-elements.module.scss";
import { BaccaratBetOptions } from '@/baccarat-multiplayer-constants';

type BeadBoardIconComponentProps = BeadBoardIconProps & {
    hasPlayerPair?: boolean;
    hasBankerPair?: boolean;
};

const PlayerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#538AFF] rounded-full -bottom-[0.6px] -right-[0.6px] z-[1]" />
);

const BankerPairDot = () => (
    <div className="absolute w-[5px] h-[5px] bg-[#FF2655] rounded-full -top-[0.6px] -left-[0.6px] z-[1]" />
);

const BeadBoardIcon: React.FC<BeadBoardIconComponentProps> = ({ choice, hasPlayerPair = false, hasBankerPair = false }) => {
    if (!choice) {
        return null;
    }

    const getDisplayInfo = (choice: string) => {
        switch (choice.toLowerCase()) {
            case BaccaratBetOptions.PLAYER:
                return { label: 'P', variant: 'player-item' };
            case BaccaratBetOptions.BANKER:
                return { label: 'B', variant: 'banker-item' };
            case BaccaratBetOptions.TIE:
                return { label: 'T', variant: 'tie-item' };
            default:
                return { label: choice.toUpperCase().charAt(0), variant: 'player-item' };
        }
    };

    const { label, variant } = getDisplayInfo(choice);

    return (
        <div className={`${styles["bead-road-icon"]} ${styles[variant]} relative`}>
            <div className={styles.text}>{label}</div>
            <div className={styles.border}></div>
            {hasPlayerPair && <PlayerPairDot />}
            {hasBankerPair && <BankerPairDot />}
        </div>
    );
};

export default BeadBoardIcon;
