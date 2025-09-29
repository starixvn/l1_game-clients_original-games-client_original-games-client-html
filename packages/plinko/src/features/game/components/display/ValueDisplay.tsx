import React from 'react';
import { ValueDisplayProps } from '../../../../shared/types';

const ValueDisplay: React.FC<ValueDisplayProps> = ({ values }) => {
    const containerClasses = [
        'value-tone-medium',
        'wrapper-1c',
        'value-tone-medium-99',
        'group-1a',
        'value-tone-medium-9c',
        'group-1b',
        'value-tone-medium-9f',
        'box-18',
        'value-tone-medium-a2',
        'box-19'
    ];

    const innerClasses = [
        'section-15',
        'value-tone-medium-98',
        'wrapper-1d',
        'value-tone-medium-9b',
        'wrapper-1f',
        'value-tone-medium-9e',
        'group-1d',
        'value-tone-medium-a1',
        'section-18',
        'value-tone-medium-a4'
    ];

    const spanClasses = [
        'value-tone-medium-97',
        'text-b',
        'value-tone-medium-9a',
        'text-d',
        'value-tone-medium-9d',
        'text-f',
        'value-tone-medium-a0',
        'text-11',
        'value-tone-medium-a3',
        'text-13'
    ];

    return (
        <div className="value">
            {values.map((value, index) => (
                <div key={`value-${index}`} className={containerClasses[index] || containerClasses[0]}>
                    <div className={innerClasses[index] || innerClasses[0]}>
                        <span className={spanClasses[index] || spanClasses[0]}>{value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ValueDisplay;


