import React, { useState, useEffect, ReactNode } from 'react';

interface FadeContentProps {
    children: ReactNode;
    blur?: boolean;
    duration?: number;
    easing?: string;
    initialOpacity?: number;
    className?: string;
}

const FadeContent: React.FC<FadeContentProps> = ({
    children,
    blur = false,
    duration = 300,
    easing = 'ease-in-out',
    initialOpacity = 0,
    className = ''
}) => {
    const [opacity, setOpacity] = useState(initialOpacity);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
            setOpacity(1);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const style: React.CSSProperties = {
        opacity,
        transition: `opacity ${duration}ms ${easing}${blur ? `, filter ${duration}ms ${easing}` : ''}`,
        filter: blur && !isVisible ? 'blur(10px)' : 'blur(0px)',
    };

    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
};

export default FadeContent;
