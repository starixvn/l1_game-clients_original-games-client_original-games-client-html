import React from "react";
import { ResultStaticBaccaratCard } from "./result-static-baccarat-card";
import styles from "./result-baccarat-animations.module.scss";

interface ResultCardSectionProps {
    cards: any[];
}

export const ResultCardSection: React.FC<ResultCardSectionProps> = ({ cards }) => {
    if (!cards || !Array.isArray(cards)) {
        return (
            <div className={styles.resultCardSection} style={{ transform: "scale(0.7)" }}>
                <div className={styles.cardContainer}>
                    {/* Empty state */}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.resultCardSection} style={{ transform: "scale(0.7)" }}>
            <div className={styles.cardContainer}>
                {cards.map((card, index) => {
                    // Handle both number arrays and card objects
                    const cardData = typeof card === 'number' ?
                        { card: card, type: 1 } :
                        card;

                    return cardData && cardData.card > 0 ? (
                        <div key={index} className={styles.cardWrapper}>
                            <ResultStaticBaccaratCard card={cardData} />
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
};
