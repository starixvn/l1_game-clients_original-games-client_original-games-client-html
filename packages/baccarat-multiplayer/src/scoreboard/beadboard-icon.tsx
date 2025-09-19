import { BeadBoardIconProps } from '@shared/components/game-components/statistic/types';
import styles from "./scoreboard-elements.module.scss";
import { BaccaratBetOptions } from '@/baccarat-multiplayer-constants';

type BeadBoardIconComponentProps = BeadBoardIconProps & {
    hasPair?: boolean;
};

const PairDot = () => <div className="absolute w-[6px] h-[6px] bg-white rounded-full -top-[2.5px] z-[1]" />;

const BeadBoardIcon: React.FC<BeadBoardIconComponentProps> = ({ choice, hasPair = false }) => {
    console.log("CHOICE::: ", choice);

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
            {hasPair && <PairDot />}
        </div>
    );
};

export default BeadBoardIcon;
