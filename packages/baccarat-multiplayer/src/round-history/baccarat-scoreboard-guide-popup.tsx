import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@shared/utils";
import { ResourceTypes } from "@shared/resources";
import { useTranslator } from "@shared/react-hooks/use-translator";

interface BaccaratScoreboardGuidePopupProps {
    isVisible: boolean;
    onClose: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const BaccaratScoreboardGuidePopup: React.FC<BaccaratScoreboardGuidePopupProps> = ({ isVisible, onClose, containerRef }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslator([ResourceTypes.BACCARAT_MULTIPLAYER]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                containerRef.current &&
                containerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isVisible, onClose, containerRef]);

    if (!shouldRender) {
        return null;
    }

    const scoreboardGuideItems = [
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/scoreboard-guide/player.svg`,
            label: "glossary_player",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/scoreboard-guide/banker.svg`,
            label: "glossary_banker",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/scoreboard-guide/tie.svg`,
            label: "glossary_tie",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/scoreboard-guide/player-pair.svg`,
            label: "glossary_player_pair",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/scoreboard-guide/banker-pair.svg`,
            label: "glossary_banker_pair",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/scoreboard-guide/natural.svg`,
            label: "glossary_natural",
        },
    ];

    return (
            <div
                ref={tooltipRef}
                className={cn(
                    "absolute top-[39px] left-[8px] z-50",
                    "bg-[#030A14] backdrop-blur-sm",
                    "rounded-lg",
                    "px-2 py-[5px] shadow-lg w-[calc(100%-8px)] rounded-3 h-[108px]",
                    "flex items-center",
                    "transition-all duration-300 ease-out",
                    "transform-gpu",
                    isAnimating
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-4"
                )}
            >
                <div className="flex gap-6">
                    <div className="flex flex-col gap-2">
                        {scoreboardGuideItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                                    <Image src={item.icon} alt={item.label} width={16} height={16} className="w-4 h-4" />
                                </div>
                                <span className={cn("text-sm text-nowrap min-w-[80px]")}>{t(item.label)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        {scoreboardGuideItems.slice(3, 6).map((item, index) => (
                            <div key={index + 3} className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                                    <Image src={item.icon} alt={item.label} width={16} height={16} className="w-4 h-4" />
                                </div>
                                <span className={cn("text-sm text-nowrap")}>{t(item.label)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className={cn(
                        "absolute -top-[5.5px] right-[69px] w-4 h-4 bg-[#030A14] rotate-45",
                        "transition-all duration-300 ease-out",
                        isAnimating ? "opacity-100" : "opacity-0"
                    )}
                />
            </div>
    );
};

export default BaccaratScoreboardGuidePopup;
