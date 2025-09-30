import React from "react";
import Styles from "./card.module.scss";
import { Props } from "./type";
import { convertRank, suffixNameMapping } from "./utils/card-utils";

export const EmptyCardIndex = -1;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const cardImages: Record<string, string> = {
    A: `${basePath}/static/images/baccarat/cards/A.webp`,
    K: `${basePath}/static/images/baccarat/cards/K.webp`,
    Q: `${basePath}/static/images/baccarat/cards/Q.webp`,
    J: `${basePath}/static/images/baccarat/cards/J.webp`,
    '10': `${basePath}/static/images/baccarat/cards/10.webp`,
    '9': `${basePath}/static/images/baccarat/cards/9.webp`,
    '8': `${basePath}/static/images/baccarat/cards/8.webp`,
    '7': `${basePath}/static/images/baccarat/cards/7.webp`,
    '6': `${basePath}/static/images/baccarat/cards/6.webp`,
    '5': `${basePath}/static/images/baccarat/cards/5.webp`,
    '4': `${basePath}/static/images/baccarat/cards/4.webp`,
    '3': `${basePath}/static/images/baccarat/cards/3.webp`,
    '2': `${basePath}/static/images/baccarat/cards/2.webp`,
    ARed: `${basePath}/static/images/baccarat/cards/A-red.webp`,
    KRed: `${basePath}/static/images/baccarat/cards/K-red.webp`,
    QRed: `${basePath}/static/images/baccarat/cards/Q-red.webp`,
    JRed: `${basePath}/static/images/baccarat/cards/J-red.webp`,
    '10Red': `${basePath}/static/images/baccarat/cards/10-red.webp`,
    '9Red': `${basePath}/static/images/baccarat/cards/9-red.webp`,
    '8Red': `${basePath}/static/images/baccarat/cards/8-red.webp`,
    '7Red': `${basePath}/static/images/baccarat/cards/7-red.webp`,
    '6Red': `${basePath}/static/images/baccarat/cards/6-red.webp`,
    '5Red': `${basePath}/static/images/baccarat/cards/5-red.webp`,
    '4Red': `${basePath}/static/images/baccarat/cards/4-red.webp`,
    '3Red': `${basePath}/static/images/baccarat/cards/3-red.webp`,
    '2Red': `${basePath}/static/images/baccarat/cards/2-red.webp`,
    diamond: `${basePath}/static/images/baccarat/cards/diamond.webp`,
    club: `${basePath}/static/images/baccarat/cards/club.webp`,
    spade: `${basePath}/static/images/baccarat/cards/spade.webp`,
    heart: `${basePath}/static/images/baccarat/cards/heart.webp`,
};

const Card: React.FC<Props> = (props) => {
    const { result, viewMode = '' } = props;
    const customClassName = props.customClassName ?? '';

    const getCardsDefault = () => {
        const rankRed = result?.type > 1 ? '' : 'Red';
        const rankImageUrl = cardImages[`${convertRank(result?.card)}${rankRed}`];
        const suitImageUrl = cardImages[`${suffixNameMapping[result?.type]}`];
        return (
            <div className={Styles['card-front-box']}>
                <div className={Styles['card-front']}>
                    <img src={rankImageUrl} className={Styles['card-rank']} width="20" height="20" alt={`card rank ${convertRank(result?.card)}`} />
                    <img src={suitImageUrl} className={Styles['card-suit']} width="20" height="20" alt={`card suit ${suffixNameMapping[result?.type]}`} />
                </div>
            </div>
        );
    };

    if (result.card === EmptyCardIndex) {
        return null;
    }

    return (
        <div className={`${Styles[customClassName]} ${Styles['card']} `}>
            <div className={Styles['result']} data-testid="result-card">
                {getCardsDefault()}
            </div>
        </div>
    );
};

export default Card;
