import React, { useEffect, useRef, useState } from "react";
import Styles from "./fade-content.module.scss";

export type FadeContentProps = {
    children: React.ReactNode;
    duration?: number; // ms
    easing?: string; // CSS timing function
    initialOpacity?: number; // 0..1
    distance?: number; // px offset on Y
    blur?: boolean;
    blurAmount?: number; // px
    className?: string;
    style?: React.CSSProperties;
};

const FadeContent: React.FC<FadeContentProps> = ({
    children,
    duration = 600,
    easing = "ease-out",
    initialOpacity = 0,
    distance = 8,
    blur = false,
    blurAmount = 8,
    className = "",
    style,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return () => {};
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(el);

        return () => {
            try {
                observer.disconnect();
            } catch {}
        };
    }, []);

    const mergedStyle: React.CSSProperties = {
        ...(style || {}),
        ["--duration" as any]: `${duration}ms`,
        ["--easing" as any]: easing,
        ["--initial-opacity" as any]: `${Math.max(0, Math.min(1, initialOpacity))}`,
        ["--distance" as any]: `${distance}px`,
        ["--blur-amount" as any]: blur ? `${blurAmount}px` : `0px`,
    };

    const classes = [
        Styles.container,
        isVisible ? Styles.visible : Styles.hidden,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div ref={ref} className={classes} style={mergedStyle}>
            {children}
        </div>
    );
};

export default FadeContent;


