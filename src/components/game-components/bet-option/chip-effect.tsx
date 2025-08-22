import { useEffect, useState } from "react";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { Chip } from "../chip-slider/chip";
import { useSettingContext } from "../../../_shared/react-contexts/setting-context";
import styles from "./chip-effect.module.scss";

export const ChipEffect = ({ choice, className }: { choice: string; className?: string }) => {
    const ownBet = useGameStore((state) => state.ownBets?.[choice] ?? 0);
    const [data, setData] = useState([]);
    const [oldValue, setOldValue] = useState(0);
    const { chipSettings } = useSettingContext();

    useEffect(() => {
        if (ownBet > 0) {
            setData((prev) => [...prev, ownBet - oldValue]);
            setOldValue(ownBet);
        } else {
            setData([]);
            setOldValue(0);
        }
    }, [ownBet]);

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
                        color={findChipSetting(value)?.color || "#B3B3B3"}
                        isHideValue={true}
                        size={22}
                    />
                </div>
            ))}
        </>
    );
};
export default ChipEffect;
