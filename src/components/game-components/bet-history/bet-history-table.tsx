export const BetHistoryTable = () => {
    const renderItem = (_) => {
        return (
            <tr className="text-center">
                <td className="py-3 text-wrap">{"07-09-2025\n12:00:54PM"}</td>
                <td className="clickable">123456</td>
                <td>2,000</td>
                <td>2,000</td>
            </tr>
        );
    };
    return (
        <div className="rounded bg-primary p-2">
            <table className="table table-border-bottom">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Round</th>
                        <th>Bet Amount</th>
                        <th>Win</th>
                    </tr>
                </thead>
                <tbody>{Array.from({ length: 10 }).map((_, index) => renderItem(index))}</tbody>
            </table>
            <div className="mt-3 mx-auto w-fit">
                <button className="bg-primary-dark btn rounded text font-bold">Show More</button>
            </div>
        </div>
    );
};
