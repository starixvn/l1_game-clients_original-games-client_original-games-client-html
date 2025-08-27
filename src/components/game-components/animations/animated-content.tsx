import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once in module scope
if (!(gsap as any)._scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    (gsap as any)._scrollTriggerRegistered = true;
}

export type AnimatedContentProps = {
    children: React.ReactNode;
    distance?: number;
    direction?: "vertical" | "horizontal";
    reverse?: boolean;
    duration?: number;
    ease?: string;
    initialOpacity?: number;
    animateOpacity?: boolean;
    scale?: number;
    threshold?: number; // 0..1
    delay?: number;
    onComplete?: () => void;
};

const AnimatedContent: React.FC<AnimatedContentProps> = ({
    children,
    distance = 100,
    direction = "vertical",
    reverse = false,
    duration = 0.8,
    ease = "power3.out",
    initialOpacity = 0,
    animateOpacity = true,
    scale = 1,
    threshold = 0.1,
    delay = 0,
    onComplete,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (el) {
            const axis = direction === "horizontal" ? "x" : "y";
            const offset = reverse ? -distance : distance;
            const startPct = (1 - Math.min(Math.max(threshold, 0), 1)) * 100;

            gsap.set(el, {
                [axis]: offset,
                scale,
                opacity: animateOpacity ? initialOpacity : 1,
            } as any);

            gsap.to(el, {
                [axis]: 0,
                scale: 1,
                opacity: 1,
                duration,
                ease,
                delay,
                onComplete,
                scrollTrigger: {
                    trigger: el,
                    start: `top ${startPct}%`,
                    toggleActions: "play none none none",
                    once: true,
                },
            } as any);

            return () => {
                try {
                    ScrollTrigger.getAll().forEach((t) => t.kill());
                    gsap.killTweensOf(el);
                } catch { }
            };
        }
    }, [
        distance,
        direction,
        reverse,
        duration,
        ease,
        initialOpacity,
        animateOpacity,
        scale,
        threshold,
        delay,
        onComplete,
    ]);

    return <div ref={ref}>{children}</div>;
};

export default AnimatedContent;


