import React from 'react';
import { WinMessageProps } from '../../../../shared/types';

const WinMessage: React.FC<WinMessageProps> = ({
    winAmount, // eslint-disable-line @typescript-eslint/no-unused-vars
    isVisible = true, // eslint-disable-line @typescript-eslint/no-unused-vars
    message, // eslint-disable-line @typescript-eslint/no-unused-vars
    multiplier, // eslint-disable-line @typescript-eslint/no-unused-vars
    betAmount, // eslint-disable-line @typescript-eslint/no-unused-vars
    onAnimationEnd // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
    // Temporarily hidden - CanvasBallLayout now handles winning messages
    // All win message display is managed by the CanvasBallLayout component
    return null;
};

export default WinMessage;


