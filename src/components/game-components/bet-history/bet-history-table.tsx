import { Table, TableColumn } from '../table';

export const BetHistoryTable = () => {
    const columns: TableColumn[] = [
        {
            key: 'time',
            header: 'Time',
        },
        {
            key: 'round',
            header: 'Round',
            isClickable: true,
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
        time: "07-09-2025\n12:00:54PM",
        round: '123456',
        betAmount: '2,000',
        win: '2,000',
    }));

    return (
        <div className="rounded bg-primary-bg p-2">
            <Table
                columns={columns}
                data={data}
            />
            <div className="mt-3 mx-auto w-fit">
                <button className="btn rounded text-primary-text font-bold bg-primary-bg">
                    Show More
                </button>
            </div>
        </div>
    );
};
