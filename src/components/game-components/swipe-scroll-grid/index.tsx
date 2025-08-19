import React, { useEffect, useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';
import { ReactDOMAttributes } from '@use-gesture/react/dist/declarations/src/types';
import { ScrollContainer } from './swipe-scroll-grid-styles';

interface SwipeScrollGridProps {
    children: React.ReactNode;
    scrollRightSignal?: boolean;
    initialScrollRight?: boolean;
}

const SwipeScrollGrid: React.FC<SwipeScrollGridProps> = ({ 
    children,
    initialScrollRight = true,
    scrollRightSignal, 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const bind = useDrag(
        ({ movement: [mx], memo = containerRef.current?.scrollLeft || 0, first, last, direction: [dx] }) => {
            if (first) {
                setDragging(true);
            }

            if (containerRef.current) {
                containerRef.current.scrollLeft = memo - mx;
            }

            if (last) {
                setDragging(false);

                const scrollWidth = containerRef.current?.scrollWidth || 0;
                const clientWidth = containerRef.current?.clientWidth || 0;

                if (dx > 0) {
                    containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                } else if (dx < 0) {
                    containerRef.current?.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
                }
            }

            return memo;
        }
    ) as unknown as (...args: any[]) => ReactDOMAttributes;

    useEffect(() => {
        if (containerRef.current && scrollRightSignal) {
            containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
        }
    }, [scrollRightSignal]);

    useEffect(() => {
        if (initialScrollRight && containerRef.current) {
            containerRef.current.scrollTo({ left: containerRef.current.scrollWidth });
        }
    }, [initialScrollRight]);

    return (
        <ScrollContainer ref={containerRef} {...bind()} $dragging={dragging}>
            {children}
        </ScrollContainer>
    );
};

export default SwipeScrollGrid;
