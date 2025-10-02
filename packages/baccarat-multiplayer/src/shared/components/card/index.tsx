import React from "react";
import Styles from "./card.module.scss";
import { Props } from "./types";
import { convertRank, suffixNameMapping } from "./utils/card-utils";
import { buildVersion } from "@shared/constants";
import { CachedImage } from "@shared/components/game-components/cached-image";
import { BgCachedImage } from "@shared/components/game-components/cached-image/bg-cached-image";

export const EmptyCardIndex = -1;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const cardImages: Record<string, string> = {
    A: `${basePath}/static/images/baccarat/cards/A.webp?v=${buildVersion}`,
    K: `${basePath}/static/images/baccarat/cards/K.webp?v=${buildVersion}`,
    Q: `${basePath}/static/images/baccarat/cards/Q.webp?v=${buildVersion}`,
    J: `${basePath}/static/images/baccarat/cards/J.webp?v=${buildVersion}`,
    '10': `${basePath}/static/images/baccarat/cards/10.webp?v=${buildVersion}`,
    '9': `${basePath}/static/images/baccarat/cards/9.webp?v=${buildVersion}`,
    '8': `${basePath}/static/images/baccarat/cards/8.webp?v=${buildVersion}`,
    '7': `${basePath}/static/images/baccarat/cards/7.webp?v=${buildVersion}`,
    '6': `${basePath}/static/images/baccarat/cards/6.webp?v=${buildVersion}`,
    '5': `${basePath}/static/images/baccarat/cards/5.webp?v=${buildVersion}`,
    '4': `${basePath}/static/images/baccarat/cards/4.webp?v=${buildVersion}`,
    '3': `${basePath}/static/images/baccarat/cards/3.webp?v=${buildVersion}`,
    '2': `${basePath}/static/images/baccarat/cards/2.webp?v=${buildVersion}`,
    ARed: `${basePath}/static/images/baccarat/cards/A-red.webp?v=${buildVersion}`,
    KRed: `${basePath}/static/images/baccarat/cards/K-red.webp?v=${buildVersion}`,
    QRed: `${basePath}/static/images/baccarat/cards/Q-red.webp?v=${buildVersion}`,
    JRed: `${basePath}/static/images/baccarat/cards/J-red.webp?v=${buildVersion}`,
    '10Red': `${basePath}/static/images/baccarat/cards/10-red.webp?v=${buildVersion}`,
    '9Red': `${basePath}/static/images/baccarat/cards/9-red.webp?v=${buildVersion}`,
    '8Red': `${basePath}/static/images/baccarat/cards/8-red.webp?v=${buildVersion}`,
    '7Red': `${basePath}/static/images/baccarat/cards/7-red.webp?v=${buildVersion}`,
    '6Red': `${basePath}/static/images/baccarat/cards/6-red.webp?v=${buildVersion}`,
    '5Red': `${basePath}/static/images/baccarat/cards/5-red.webp?v=${buildVersion}`,
    '4Red': `${basePath}/static/images/baccarat/cards/4-red.webp?v=${buildVersion}`,
    '3Red': `${basePath}/static/images/baccarat/cards/3-red.webp?v=${buildVersion}`,
    '2Red': `${basePath}/static/images/baccarat/cards/2-red.webp?v=${buildVersion}`,
    diamond: `${basePath}/static/images/baccarat/cards/diamond.webp?v=${buildVersion}`,
    club: `${basePath}/static/images/baccarat/cards/club.webp?v=${buildVersion}`,
    spade: `${basePath}/static/images/baccarat/cards/spade.webp?v=${buildVersion}`,
    heart: `${basePath}/static/images/baccarat/cards/heart.webp?v=${buildVersion}`,
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
                <BgCachedImage
                    pathImage={`${basePath}/static/images/baccarat/cards/card-front.webp?v=${buildVersion}`}
                    className={Styles['card-front']}
                    backgroundSize="100% 100%"
                    backgroundPosition="center"
                    backgroundRepeat="no-repeat"
                >
                    <CachedImage
                        src={rankImageUrl}
                        className={Styles['card-rank']}
                        width={20}
                        height={20}
                        alt={`card rank ${convertRank(result?.card)}`}
                        priority
                    />
                    <CachedImage
                        src={suitImageUrl}
                        className={Styles['card-suit']}
                        width={20}
                        height={20}
                        alt={`card suit ${suffixNameMapping[result?.type]}`}
                        priority
                    />
                </BgCachedImage>
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
