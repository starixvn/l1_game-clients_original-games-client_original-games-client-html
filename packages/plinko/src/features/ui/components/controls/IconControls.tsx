import React from 'react';
import { IconControlsProps } from '../../../../shared/types';

const IconControls: React.FC<IconControlsProps> = ({ onSoundToggle }) => {
    return (
        <div className="icons">
            <div className="frame-e2">
                <span className="price">Nova88 Original</span>
            </div>
            <div className="sound-icon" onClick={onSoundToggle} role="button" tabIndex={0}>
                <div className="icon" />
            </div>
            <div className="sound-icon-e3">
                <div className="icon-e4">
                    <div className="group-e5" />
                </div>
            </div>
            <div className="help-icon" role="button" tabIndex={0}>
                <div className="icon-e6" />
            </div>
            <div className="security-icon" role="button" tabIndex={0}>
                <div className="icon-e7" />
            </div>
        </div>
    );
};

export default IconControls;


