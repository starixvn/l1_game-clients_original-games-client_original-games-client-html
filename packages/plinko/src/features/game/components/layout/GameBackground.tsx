import React from 'react';
import { GameBackgroundProps } from '../../../../shared/types';

const GameBackground: React.FC<GameBackgroundProps> = () => {
    return (
        <div
            className="bg-game-plinko"
        >
            <div className="polygon" />
            <div className="light-bg-pc-caad" />
            <div className="group" />
            <div className="bg" />
            <div className="frame" />
            <div className="bottom" />
            <div className="light-ray" />
            <div className="bottom-1" />
        </div>
    );
};

export default GameBackground;


