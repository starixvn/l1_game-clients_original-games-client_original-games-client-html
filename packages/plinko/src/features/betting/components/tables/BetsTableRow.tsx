import React from 'react';
import { BetsTableRowProps } from '../../../../shared/types';
import Styles from './BetsTableRow.module.scss';

const BetsTableRow: React.FC<BetsTableRowProps> = ({ bet, rowClass }) => {
    return (
        <div className={`$row-f4 ${Styles[rowClass] || ""}`}>
            <div className="content-table">
                <span className="john-smith-annie">{bet.player}</span>
            </div>
            <div className="content-table-f5">
                <span className="empty-f6">{bet.betAmount}</span>
            </div>
            <div className="empty-f7">
                <span className="row-f8">{bet.payout}</span>
            </div>
        </div>
    );
};

export default BetsTableRow;


