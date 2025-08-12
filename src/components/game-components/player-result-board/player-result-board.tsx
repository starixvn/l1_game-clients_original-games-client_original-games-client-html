import styles from "./player-result-board.module.scss";

export const PlayerResultBoard = () => {
    const renderItem = (_) => {
        return (
            <tr className="text-center">
                <td className="py-3">Player 1</td>
                <td>100</td>
                <td>100</td>
            </tr>
        );
    };
    return (
        <div className="h-full rounded-xl bg-primary p-3 pb-1 mb-3">
            <div className="flex justify-between bg-primary-dark rounded-xl p-2 mb-2">
                <div className="flex items-center">
                    <span className={styles["icon-online-user"]}></span>
                    <span>10 players</span>
                </div>
                <div>#1123444</div>
            </div>
            <div>
                <table className="table table-border-bottom">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Bet Amount</th>
                            <th>Win</th>
                        </tr>
                    </thead>
                    <tbody>{Array.from({ length: 10 }).map((_, index) => renderItem(index))}</tbody>
                </table>
            </div>
        </div>
    );
};
