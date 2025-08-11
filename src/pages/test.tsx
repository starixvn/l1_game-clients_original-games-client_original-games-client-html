import React from "react";
import { Plate } from "../components/game-components/sedie-object";
import { GameFrame as GameFrameComponent } from "../components/layouts/game-frame";
import { CountdownTimer } from "../components/game-components/countdown-timer/new-countdown-timer";
import { RoundHistory } from "../components/game-components/round-history/demo";
import { RoundHistoryItem } from "../components/game-components/round-history/demo/item";
import { Menu } from "../components/game-components/menu/menu";
import { PlayerResultBoard } from "../components/game-components/player-result-board/player-result-board";
import { MenuIcon } from "../components/game-components/menu/menu-icon";
import { IconStatistic } from "../components/game-components/statistic/icon-statistic";
import { BetHistoryTable } from "../components/game-components/bet-history/bet-history-table";

const GameFrame = () => {
    const renderItem = (props: any) => {
        return <RoundHistoryItem {...props} />;
    };
    return (
        <GameFrameComponent
            roundHistory={<RoundHistory renderItem={renderItem} numberOfItems={15} sideButton={<IconStatistic />} />}
            countDownTimer={<CountdownTimer />}
            betOptions={<div>Bet Options</div>}
            gameObject={<Plate />}
        />
    );
};

const BetControlFrame = () => (
    <div className="bg-primary">
        <h3>Bet Control Frame</h3>
        <div className="d-flex flex-wrap">
            <div className="col-12 col-md-6">
                <SlidingChipFrame />
            </div>
            <div className="col-12 col-md-6">
                <RoundInfoFrame />
            </div>
        </div>
    </div>
);

const SlidingChipFrame = () => (
    <div className={"sliding-chip-frame"}>
        <h3>Sliding Chip Frame</h3>
        <p>Sliding chip interface</p>
    </div>
);

const RoundInfoFrame = () => (
    <div className={"round-info-frame"}>
        <h3>Round Info Frame</h3>
        <p>Current round details and status</p>
    </div>
);

const Test = () => {
    return (
        <div className={"page-container"}>
            <div className="container">
                <div className="d-flex flex-wrap">
                    <div className="col-12 col-lg-8 mb-3 px-3">
                        <GameFrame />
                        <BetControlFrame />
                        <Menu
                            rightSide={
                                <>
                                    <MenuIcon name="sound" />
                                    <MenuIcon name="guide" />
                                    <MenuIcon name="security" />
                                </>
                            }
                        />
                    </div>
                    <div className="col-12 col-lg-4 mb-3 px-3">
                        <PlayerResultBoard />
                    </div>
                    <div className="col-12 px-3">
                        <BetHistoryTable />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Test;
