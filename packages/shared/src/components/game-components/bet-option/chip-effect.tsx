import { useEffect, useState } from "react";
import useGameStore from '@shared/merged/_shared/stores/game-store/game-store';
import { Chip } from "../chip-slider/chip";
import { useSettingContext } from '@shared/merged/_shared/react-contexts/setting-context';
import styles from "./chip-effect.module.scss";
import { useShallow } from "zustand/shallow";

export const ChipEffect = ({ choice, className }: { choice: string; className?: string }) => {
    const { ownBet, roundId } = useGameStore(
        useShallow((state) => ({ ownBet: state.ownBets?.[choice] ?? 0, roundId: state.roundId ?? 0 }))
    );
    const [data, setData] = useState([]);
    const [oldValue, setOldValue] = useState(ownBet);
    const [isReady, setIsReady] = useState(roundId !== 0);
    const { chipSettings } = useSettingContext();

    useEffect(() => {
        if (!isReady) {
            return;
        }
        if (ownBet > 0) {
            ownBet - oldValue > 0 && setData((prev) => [...prev, ownBet - oldValue]);
            setOldValue(ownBet);
        } else {
            setData([]);
            setOldValue(0);
        }
    }, [ownBet]);

    useEffect(() => {
        if (roundId > 0) {
            setOldValue(ownBet);
            setIsReady(true);
        }
    }, [roundId]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (data.length) {
            timer = setTimeout(() => {
                setData([]);
            }, 700);
        }

        return () => timer && clearTimeout(timer);
    }, [data]);

    if (data.length === 0) {
        return <></>;
    }

    const findChipSetting = (value) => {
        return chipSettings?.find((chip) => chip.value === value);
    };

    return (
        <>
            {data.map((value, index) => (
                <div key={index} className={`${styles["chip-effect"]} ${className}`}>
                    <Chip
                        value={value}
                        text={findChipSetting(value)?.text}
                        color={findChipSetting(value)?.color}
                        isHideValue={true}
                        size={22}
                        className="w-[22px] h-[22px]"
                    />
                </div>
            ))}
        </>
    );
};
export default ChipEffect;
