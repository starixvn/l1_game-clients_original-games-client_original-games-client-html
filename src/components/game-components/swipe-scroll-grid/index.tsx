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

    const logDimensions = () => {
        if (process.env.NODE_ENV !== 'development') return;

        if (containerRef.current) {
            const element = containerRef.current;
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);

            // Check parent container
            const parentElement = element.parentElement;
            let parentInfo = null;
            if (parentElement) {
                const parentRect = parentElement.getBoundingClientRect();
                const parentComputedStyle = window.getComputedStyle(parentElement);
                parentInfo = {
                    rectWidth: parentRect.width,
                    rectHeight: parentRect.height,
                    display: parentComputedStyle.display,
                    position: parentComputedStyle.position,
                    overflow: parentComputedStyle.overflow,
                    padding: parentComputedStyle.padding,
                    margin: parentComputedStyle.margin,
                    flexDirection: parentComputedStyle.flexDirection,
                    alignItems: parentComputedStyle.alignItems,
                    justifyContent: parentComputedStyle.justifyContent,
                    cssWidth: parentComputedStyle.width,
                    minWidth: parentComputedStyle.minWidth,
                    maxWidth: parentComputedStyle.maxWidth
                };
            }

            // Check grandparent container
            const grandparentElement = parentElement?.parentElement;
            let grandparentInfo = null;
            if (grandparentElement) {
                const grandparentRect = grandparentElement.getBoundingClientRect();
                const grandparentComputedStyle = window.getComputedStyle(grandparentElement);
                grandparentInfo = {
                    rectWidth: grandparentRect.width,
                    rectHeight: grandparentRect.height,
                    display: grandparentComputedStyle.display,
                    position: grandparentComputedStyle.position,
                    overflow: grandparentComputedStyle.overflow,
                    cssWidth: grandparentComputedStyle.width,
                    minWidth: grandparentComputedStyle.minWidth,
                    maxWidth: grandparentComputedStyle.maxWidth
                };
            }

            // Check children dimensions
            const children = Array.from(element.children);
            const childrenInfo = children.map((child, index) => {
                const childRect = child.getBoundingClientRect();
                const childComputedStyle = window.getComputedStyle(child as HTMLElement);
                return {
                    index,
                    width: childRect.width,
                    height: childRect.height,
                    display: childComputedStyle.display,
                    position: childComputedStyle.position,
                    gridTemplateColumns: childComputedStyle.gridTemplateColumns,
                    gridAutoColumns: childComputedStyle.gridAutoColumns
                };
            });

            console.log("[SwipeScrollGrid] Dimensions:", {
                rectWidth: rect.width,
                rectHeight: rect.height,
                offsetWidth: element.offsetWidth,
                offsetHeight: element.offsetHeight,
                scrollWidth: element.scrollWidth,
                scrollHeight: element.scrollHeight,
                clientWidth: element.clientWidth,
                clientHeight: element.clientHeight,
                scrollLeft: element.scrollLeft,
                scrollTop: element.scrollTop,
                padding: computedStyle.padding,
                margin: computedStyle.margin,
                border: computedStyle.border,
                overflow: computedStyle.overflow,
                overflowX: computedStyle.overflowX,
                overflowY: computedStyle.overflowY,
                display: computedStyle.display,
                position: computedStyle.position,
                computedWidth: computedStyle.width,
                computedHeight: computedStyle.height,
                minWidth: computedStyle.minWidth,
                maxWidth: computedStyle.maxWidth,
                minHeight: computedStyle.minHeight,
                maxHeight: computedStyle.maxHeight
            });

            console.log("[SwipeScrollGrid] Parent Container:", parentInfo);
            console.log("[SwipeScrollGrid] Grandparent Container:", grandparentInfo);
            console.log("[SwipeScrollGrid] Children:", {
                count: children.length,
                children: childrenInfo
            });

            // Calculate width issues
            if (element.scrollWidth > element.clientWidth) {
                console.log("[SwipeScrollGrid] WIDTH ISSUE DETECTED:", {
                    scrollWidth: element.scrollWidth,
                    clientWidth: element.clientWidth,
                    widthDifference: element.scrollWidth - element.clientWidth,
                    containerWidth: rect.width,
                    overflowX: computedStyle.overflowX
                });
            }
        }
    };

    const bind = useDrag(
        ({ movement: [mx], memo = containerRef.current?.scrollLeft || 0, first, last, direction: [dx] }) => {
            if (first) {
                setDragging(true);
                if (process.env.NODE_ENV === 'development') {
                    console.log("[SwipeScrollGrid] Drag started:", {
                        initialScrollLeft: memo,
                        movement: mx
                    });
                }
            }

            if (containerRef.current) {
                containerRef.current.scrollLeft = memo - mx;
                if (process.env.NODE_ENV === 'development') {
                    console.log("[SwipeScrollGrid] Drag update:", {
                        movement: mx,
                        newScrollLeft: memo - mx,
                        direction: dx
                    });
                }
            }

            if (last) {
                setDragging(false);

                const scrollWidth = containerRef.current?.scrollWidth || 0;
                const clientWidth = containerRef.current?.clientWidth || 0;

                if (process.env.NODE_ENV === 'development') {
                    console.log("[SwipeScrollGrid] Drag ended:", {
                        direction: dx,
                        scrollWidth,
                        clientWidth,
                        maxScrollLeft: scrollWidth - clientWidth
                    });
                }

                if (dx > 0) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log("[SwipeScrollGrid] Scrolling to left (0)");
                    }
                    containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                } else if (dx < 0) {
                    if (process.env.NODE_ENV === 'development') {
                        console.log("[SwipeScrollGrid] Scrolling to right (max)");
                    }
                    containerRef.current?.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
                }
            }

            return memo;
        }
    ) as unknown as (...args: any[]) => ReactDOMAttributes;

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("[SwipeScrollGrid] scrollRightSignal changed:", scrollRightSignal);
        }
        if (containerRef.current && scrollRightSignal) {
            const scrollWidth = containerRef.current.scrollWidth;
            if (process.env.NODE_ENV === 'development') {
                console.log("[SwipeScrollGrid] Scrolling to right due to signal:", {
                    scrollWidth,
                    clientWidth: containerRef.current.clientWidth
                });
            }
            containerRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
        }
    }, [scrollRightSignal]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("[SwipeScrollGrid] initialScrollRight effect:", initialScrollRight);
        }
        if (initialScrollRight && containerRef.current) {
            const scrollWidth = containerRef.current.scrollWidth;
            if (process.env.NODE_ENV === 'development') {
                console.log("[SwipeScrollGrid] Initial scroll to right:", {
                    scrollWidth,
                    clientWidth: containerRef.current.clientWidth
                });
            }
            containerRef.current.scrollTo({ left: scrollWidth });
        }
    }, [initialScrollRight]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("[SwipeScrollGrid] Component mounted");
        }

        // Immediately set the container width
        if (containerRef.current) {
            const parentElement = containerRef.current.parentElement;
            if (parentElement) {
                const parentWidth = parentElement.offsetWidth;
                if (process.env.NODE_ENV === 'development') {
                    console.log("[SwipeScrollGrid] Immediate width setup:", { parentWidth });
                }

                // Force immediate width setting
                containerRef.current.style.setProperty('width', '100%', 'important');
                containerRef.current.style.setProperty('min-width', `${parentWidth}px`, 'important');
                containerRef.current.style.setProperty('max-width', 'none', 'important');
            }
        }

        logDimensions();

        // Log dimensions after a delay to ensure children are rendered
        const timer = setTimeout(() => {
            if (process.env.NODE_ENV === 'development') {
                console.log("[SwipeScrollGrid] Delayed dimension check");
            }
            logDimensions();
            updateContainerWidth();
        }, 100);

        // Add window resize listener
        const handleResize = () => {
            if (process.env.NODE_ENV === 'development') {
                console.log("[SwipeScrollGrid] Window resized, updating container width");
            }
            updateContainerWidth();
        };

        window.addEventListener('resize', handleResize);

        // Add ResizeObserver to monitor parent container size changes
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current?.parentElement) {
            resizeObserver = new ResizeObserver((entries) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log("[SwipeScrollGrid] Parent container resized, updating width");
                }
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
        if (process.env.NODE_ENV === 'development') {
            console.log("[SwipeScrollGrid] Children changed, logging dimensions");
        }
        logDimensions();

        // Update container width immediately
        updateContainerWidth();

        // Update again after a short delay to ensure scoreboard has rendered
        const timer = setTimeout(() => {
            if (process.env.NODE_ENV === 'development') {
                console.log("[SwipeScrollGrid] Children changed - delayed width update");
            }
            updateContainerWidth();
            logDimensions();
        }, 50);

        return () => clearTimeout(timer);
    }, [children]);

    const updateContainerWidth = () => {
        if (containerRef.current) {
            const scoreboardElement = containerRef.current.querySelector('[data-testid="scoreboard"]') as HTMLElement;
            const parentElement = containerRef.current.parentElement;

            if (scoreboardElement && parentElement) {
                const scoreboardWidth = scoreboardElement.offsetWidth;
                const containerWidth = containerRef.current.offsetWidth;
                const parentWidth = parentElement.offsetWidth;
                const parentRect = parentElement.getBoundingClientRect();

                if (process.env.NODE_ENV === 'development') {
                    console.log("[SwipeScrollGrid] updateContainerWidth:", {
                        scoreboardWidth,
                        containerWidth,
                        parentWidth,
                        parentRectWidth: parentRect.width,
                        needsUpdate: scoreboardWidth > containerWidth || containerWidth < parentWidth
                    });
                }

                // Force the container to take the full parent width
                containerRef.current.style.setProperty('width', '100%', 'important');
                containerRef.current.style.setProperty('min-width', '100%', 'important');
                containerRef.current.style.setProperty('max-width', 'none', 'important');

                // If scoreboard is wider than parent, ensure container can accommodate it
                if (scoreboardWidth > parentWidth) {
                    containerRef.current.style.setProperty('min-width', `${scoreboardWidth}px`, 'important');
                    if (process.env.NODE_ENV === 'development') {
                        console.log("[SwipeScrollGrid] Container width updated to accommodate scoreboard:", scoreboardWidth);
                    }
                } else {
                    // Ensure container takes full parent width
                    containerRef.current.style.setProperty('min-width', `${parentWidth}px`, 'important');
                    if (process.env.NODE_ENV === 'development') {
                        console.log("[SwipeScrollGrid] Container width updated to parent width:", parentWidth);
                    }
                }

                // Force a reflow to ensure the width changes take effect
                containerRef.current.offsetHeight;

                // Log the final state
                setTimeout(() => {
                    if (process.env.NODE_ENV === 'development') {
                        const finalWidth = containerRef.current?.offsetWidth;
                        const finalRect = containerRef.current?.getBoundingClientRect();
                        console.log("[SwipeScrollGrid] Final container state:", {
                            finalWidth,
                            finalRectWidth: finalRect?.width,
                            finalStyle: containerRef.current?.style.cssText
                        });
                    }
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
            onScroll={(e) => {
                if (process.env.NODE_ENV === 'development') {
                    const target = e.target as HTMLDivElement;
                    console.log("[SwipeScrollGrid] Scroll event:", {
                        scrollLeft: target.scrollLeft,
                        scrollTop: target.scrollTop,
                        scrollWidth: target.scrollWidth,
                        clientWidth: target.clientWidth
                    });
                }
            }}
        >
            {children}
        </ScrollContainer>
    );
};

export default SwipeScrollGrid;
