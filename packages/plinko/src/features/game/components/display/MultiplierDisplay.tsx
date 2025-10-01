import React from 'react';
import { MultiplierDisplayProps } from '../../../../shared/types';

const MultiplierDisplay: React.FC<MultiplierDisplayProps> = ({ multipliers }) => {
    const baseClasses = [
        'multifiler-no-medium',
        'multifiler-no-medium-3',
        'multifiler-no-medium-5',
        'multifiler-no-medium-7',
        'multifiler-no-medium-9',
        'multifiler-no-medium-b',
        'multifiler-no-medium-d',
        'multifiler-no-medium-f',
        'multifiler-no-medium-11'
    ];

    const spanClasses = [
        'x',
        'x-4',
        'x-6',
        'x-8',
        'x-a',
        'x-c',
        'x-e',
        'x-10',
        'x-12'
    ];

    return (
        <div
            className="multifiler"
        >
            {multipliers.map((multiplier, index) => (
                <div key={`multiplier-${index}`} className={baseClasses[index] || baseClasses[0]}>
                    <span className={spanClasses[index] || spanClasses[0]}>{multiplier}</span>
                </div>
            ))}
        </div>
    );
};

export default MultiplierDisplay;


