import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface LandingSignalProps {
    isVisible: boolean;
    success: boolean;
    onAnimationEnd?: () => void;
}

const fadeIn = keyframes`
    0% {
        opacity: 0;
        transform: translateX(20px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
`;

const fadeOut = keyframes`
    0% {
        opacity: 1;
        transform: translateX(0);
    }
    100% {
        opacity: 0;
        transform: translateX(20px);
    }
`;

const SignalContainer = styled.div<{ $isVisible: boolean; $success: boolean }>`
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    background: ${props => props.$success
        ? 'rgba(16, 185, 129, 0.95)'
        : 'rgba(239, 68, 68, 0.95)'};
    backdrop-filter: blur(8px);
    border: 1px solid ${props => props.$success ? '#065f46' : '#991b1b'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: ${props => props.$isVisible ? fadeIn : fadeOut} 0.4s ease-out;
    min-width: 140px;
    max-width: 180px;
`;

const Icon = styled.span<{ $success: boolean }>`
    font-size: 16px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
`;

const Message = styled.span`
    color: white;
    font-size: 13px;
    font-weight: 500;
    flex: 1;
    text-align: center;
`;

const LandingSignal: React.FC<LandingSignalProps> = ({
    isVisible,
    success,
    onAnimationEnd
}) => {
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowAnimation(true);
            const timer = setTimeout(() => {
                setShowAnimation(false);
                setTimeout(() => {
                    onAnimationEnd?.();
                }, 400); // Wait for fade out animation
            }, 1500); // Show for 1.5 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onAnimationEnd]);

    if (!isVisible && !showAnimation) {
        return null;
    }

    return (
        <SignalContainer $isVisible={showAnimation} $success={success}>
            <Icon $success={success}>
                {success ? '✓' : '✗'}
            </Icon>
            <Message>
                {success ? 'Correct slot' : 'Wrong slot'}
            </Message>
        </SignalContainer>
    );
};

export default LandingSignal;
