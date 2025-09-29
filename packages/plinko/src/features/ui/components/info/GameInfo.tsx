import React from 'react';
import { GameInfoProps } from '../../../../shared/types';
import { logger } from '../../../../services';

interface ExtendedGameInfoProps extends GameInfoProps {
    userName?: string;
    userRate?: number;
}

const GameInfo: React.FC<ExtendedGameInfoProps> = ({ gameName, rtp, userName, userRate }) => {
    const handleStylesLog = (element: HTMLElement | null, componentName: string) => {
        if (element) {
            const styles = window.getComputedStyle(element);
            logger.info(`GameInfo ${componentName} computed styles`, {
                width: styles.width,
                height: styles.height,
                position: styles.position,
                display: styles.display,
                fontSize: styles.fontSize,
                color: styles.color,
                background: styles.background,
                className: element.className
            });
        }
    };

    return (
        <div
            className="game-name-area"
            ref={(el) => handleStylesLog(el, 'main container')}
        >
            <div className="frame-e8">
                <span className="price-e9">{gameName}</span>
                {userName && (
                    <div className="user-info" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Player: {userName} {userRate ? `(Rate: ${userRate}x)` : ''}
                    </div>
                )}
            </div>
            <div className="frame-ea">
                <div className="rtp">
                    <div className="price-eb">
                        <span className="rtp-ec">RTP:</span>
                        <span className="empty-ed"> </span>
                        <span className="percentage-ee">{rtp}</span>
                        <span className="empty-ef"> </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameInfo;


