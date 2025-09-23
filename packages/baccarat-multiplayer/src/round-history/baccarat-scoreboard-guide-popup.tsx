import React, { useRef, useEffect } from "react";
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

    if (!isVisible) {
        return null;
    }

    const scoreboardGuideItems = [
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/bead-road/player.svg`,
            label: "glossary_player",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/bead-road/banker.svg`,
            label: "glossary_banker",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/bead-road/tie.svg`,
            label: "glossary_tie",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/bead-road/player-pair.svg`,
            label: "glossary_player_pair",
        },
        {
            icon: `${basePath}/static/images/baccarat/scoreboard/bead-road/banker-pair.svg`,
            label: "glossary_banker_pair",
        },
    ];

    return (
            <div
                ref={tooltipRef}
                className={cn(
                    "absolute top-10 left-[8px] z-50",
                    "bg-[#030A14] backdrop-blur-sm",
                    "rounded-lg",
                    "p-1 py-[5px] shadow-lg w-[calc(100%-8px)] rounded-3"
                )}
            >
                {/* Legend content */}
                <div className="space-y-1">
                    {scoreboardGuideItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-4 h-4">
                                <Image src={item.icon} alt={item.label} width={16} height={16} className="w-4 h-4" />
                            </div>
                            <span className={cn("text-sm leading-[14px]")}>{t(item.label)}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute -top-1 right-[91px] w-5 h-5 bg-[#030A14] rotate-45" />
            </div>
    );
};

export default BaccaratScoreboardGuidePopup;
