import { FC, useEffect, useState } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import Styles from "./style.module.scss";
import useGameStore from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/shallow";

interface BalanceItem {
    id: number;
    amount: number;
    timestamp: number;
}

const DeductBalanceEffect: FC = () => {
    const { endBet, setEndBet } = useGameStore(useShallow((state) => ({ endBet: state.endBet, setEndBet: state.setEndBet })));

    const [data, setData] = useState<BalanceItem[]>([]);
    const [nextId, setNextId] = useState(0);

    useEffect(() => {
        if (endBet > 0) {
            const newItem: BalanceItem = {
                id: nextId,
                amount: endBet,
                timestamp: Date.now(),
            };

            setData((prev) => [...prev, newItem]);
            setNextId((prev) => prev + 1);
            setEndBet(0);
        }
    }, [endBet, setEndBet, nextId]);

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

    return (
        <>
            {data.map((item) => (
                <div key={item.id} className={Styles["deduct-effect"]}>
                    {`-${numberWithCommas(item.amount, 2)}`}
                </div>
            ))}
        </>
    );
};

export default DeductBalanceEffect;
