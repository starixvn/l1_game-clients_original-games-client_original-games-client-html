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
            const scrollWidth = containerRef.current.scrollWidth;
            containerRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
        }
    }, [scrollRightSignal]);

    useEffect(() => {
        if (initialScrollRight && containerRef.current) {
            const scrollWidth = containerRef.current.scrollWidth;
            containerRef.current.scrollTo({ left: scrollWidth });
        }
    }, [initialScrollRight]);

    useEffect(() => {

        // Immediately set the container width
        if (containerRef.current) {
            const parentElement = containerRef.current.parentElement;
            if (parentElement) {
                const parentWidth = parentElement.offsetWidth;
                // Force immediate width setting
                containerRef.current.style.setProperty('width', '100%', 'important');
                containerRef.current.style.setProperty('min-width', `${parentWidth}px`, 'important');
                containerRef.current.style.setProperty('max-width', 'none', 'important');
            }
        }

        // Log dimensions after a delay to ensure children are rendered
        const timer = setTimeout(() => {
            updateContainerWidth();
        }, 100);

        // Add window resize listener
        const handleResize = () => {
            updateContainerWidth();
        };

        window.addEventListener('resize', handleResize);

        // Add ResizeObserver to monitor parent container size changes
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current?.parentElement) {
            resizeObserver = new ResizeObserver(() => {
                updateContainerWidth();
            });
            resizeObserver.observe(containerRef.current.parentElement);
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        // Update container width immediately
        updateContainerWidth();

        // Update again after a short delay to ensure scoreboard has rendered
        const timer = setTimeout(() => {
            updateContainerWidth();
        }, 50);

        return () => clearTimeout(timer);
    }, [children]);

    const updateContainerWidth = () => {
        if (containerRef.current) {
            const scoreboardElement = containerRef.current.querySelector<HTMLElement>('[data-testid="scoreboard"]');
            const parentElement = containerRef.current.parentElement;

            if (scoreboardElement && parentElement) {
                const scoreboardWidth = scoreboardElement.offsetWidth;
                const parentWidth = parentElement.offsetWidth;


                // Force the container to take the full parent width
                containerRef.current.style.setProperty('width', '100%', 'important');
                containerRef.current.style.setProperty('min-width', '100%', 'important');
                containerRef.current.style.setProperty('max-width', 'none', 'important');

                // If scoreboard is wider than parent, ensure container can accommodate it
                if (scoreboardWidth > parentWidth) {
                    containerRef.current.style.setProperty('min-width', `${scoreboardWidth}px`, 'important');
                } else {
                    // Ensure container takes full parent width
                    containerRef.current.style.setProperty('min-width', `${parentWidth}px`, 'important');
                }

                // Reflow not required here; styles above are sufficient

                // Log the final state
                setTimeout(() => {
                    // final state check no-op
                }, 10);
            }
        }
    };

    return (
        <ScrollContainer
            ref={containerRef}
            {...bind()}
            $dragging={dragging}
            data-testid="swipe-scroll-grid"
            className="gap-x-[2px] px-[2px] w-full"
        >
            {children}
        </ScrollContainer>
    );
};

export default SwipeScrollGrid;
