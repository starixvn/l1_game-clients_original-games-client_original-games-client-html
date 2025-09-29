import React from 'react';
import { GameBackgroundProps } from '../../../../shared/types';
import { logger } from '../../../../services';

const GameBackground: React.FC<GameBackgroundProps> = () => {
    const handleStylesLog = (element: HTMLElement | null, componentName: string) => {
        if (element) {
            const styles = window.getComputedStyle(element);
            logger.info(`GameBackground ${componentName} computed styles`, {
                width: styles.width,
                height: styles.height,
                position: styles.position,
                display: styles.display,
                background: styles.background,
                className: element.className
            });
        }
    };

    return (
        <div
            className="bg-game-plinko"
            ref={(el) => handleStylesLog(el, 'main container')}
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


