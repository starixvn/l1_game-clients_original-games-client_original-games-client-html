import { Table, TableColumn } from '../table';

export const PlayerResultBoard = () => {
    const columns: TableColumn[] = [
        {
            key: 'player',
            header: 'Player',
        },
        {
            key: 'betAmount',
            header: 'Bet Amount',
        },
        {
            key: 'win',
            header: 'Win',
        },
    ];

    const data = Array.from({ length: 10 }).map((_, index) => ({
        player: `Player ${index + 1}`,
        betAmount: '100',
        win: '100',
    }));

    return (
        <div className="h-full rounded-xl bg-primary p-3 pb-1 mb-3 bg-primary-bg">
            <div className="flex justify-between bg-[#ebebeb] dark:bg-[#101721] rounded-xl p-2 mb-2">
                <div className="flex items-center">
                    <div className="inline-flex items-center justify-center mr-2 bg-[#24d67c33] rounded-full">
                        <div className="inline-block w-2 h-2 m-1 bg-[#24d67c] rounded-full"></div>
                    </div>
                    <span className="text-primary-text">10 players</span>
                </div>
                <div className="text-primary-text">#1123444</div>
            </div>
            <div>
                <Table
                    columns={columns}
                    data={data}
                />
            </div>
        </div>
    );
};
