export const BetHistoryTable = () => {
    const renderItem = (_) => {
        return (
            <tr className="text-center">
                <td className="py-3 text-wrap text-secondary-text">{"07-09-2025\n12:00:54PM"}</td>
                <td className="clickable text-table-text-clickable">123456</td>
                <td className="text-secondary-text">2,000</td>
                <td className="text-secondary-text">2,000</td>
            </tr>
        );
    };
    return (
        <div className="rounded bg-primary-bg p-2">
            <table className="table">
                <thead>
                    <tr>
                        <th className="text-primary-text">Time</th>
                        <th className="text-primary-text">Round</th>
                        <th className="text-primary-text">Bet Amount</th>
                        <th className="text-primary-text">Win</th>
                    </tr>
                </thead>
                <tbody className="bg-secondary-bg">{Array.from({ length: 10 }).map((_, index) => renderItem(index))}</tbody>
            </table>
            <div className="mt-3 mx-auto w-fit">
                <button className="bg-primary-bg btn rounded text font-bold">Show More</button>
            </div>
        </div>
    );
};
