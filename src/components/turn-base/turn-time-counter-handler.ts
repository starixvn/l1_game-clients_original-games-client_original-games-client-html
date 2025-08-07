import { GameDurations } from "../game-base/type";

export class TurnTimeline {
    /**
     *
     */
    constructor(public turnIndex: number, public placingBet: TimelineRange, public displayResult: TimelineRange) {
        this.placeBetDuration = this.placingBet.startTime - this.placingBet.endTime;
        this.displayResultDuration = this.displayResult.startTime - this.displayResult.endTime;
    }

    placeBetDuration: number;
    displayResultDuration: number;

    isInPlacingBetTime = (roundRemainingTime: number) => {
        return roundRemainingTime <= this.placingBet.startTime && roundRemainingTime >= this.placingBet.endTime;
    };

    isInDisplayingResultTime = (roundRemainingTime: number) => {
        return roundRemainingTime <= this.displayResult.startTime && roundRemainingTime >= this.displayResult.endTime;
    };
}

type TimelineRange = {
    startTime: number;
    endTime: number;
};

export type Turn = {
    id: number;
    index: number;
};

export class TurnTimelineCounter {
    allTurnTimeline: TurnTimeline[] = [];
    totalTurn = 0;

    /**
     *
     */
    constructor(private readonly durations: GameDurations) {
        this.calculateTurnTimeline();
    }

    calculateTurnTimeline = () => {
        const wholeRoundWithoutSwitchRoundAmimation = this.durations.wholeRound - this.durations.switchRoundAnimation;
        this.totalTurn = wholeRoundWithoutSwitchRoundAmimation / this.durations.wholeTurn;
        const showResult = this.durations.showResult + this.durations.beforePlaceBet;
        let allTurnRemainingTime = wholeRoundWithoutSwitchRoundAmimation - showResult;
        for (let turnIndex = 1; turnIndex <= this.totalTurn; turnIndex++) {
            const startPlacingBet = allTurnRemainingTime;
            const endPlacingBet = (allTurnRemainingTime -= this.durations.placingBets);
            let startDisplayResult = allTurnRemainingTime;
            let endDisplayResult = (allTurnRemainingTime -= showResult);
            endDisplayResult += 1;

            if (startDisplayResult <= 0) {
                startDisplayResult = this.durations.wholeRound;
                endDisplayResult = startDisplayResult - this.durations.switchRoundAnimation - showResult + 1;
            }

            const turnTimeline: TurnTimeline = new TurnTimeline(
                turnIndex,
                { startTime: startPlacingBet, endTime: endPlacingBet },
                { startTime: startDisplayResult, endTime: endDisplayResult }
            );

            this.allTurnTimeline.push(turnTimeline);
        }
    };

    calculateTurn = (roundRemainingTime: number, roundId?: number, turnId?: number) => {
        const turn: Turn = {
            id: 0,
            index: 0,
        };

        for (const turnTimeline of this.allTurnTimeline) {
            if (turnTimeline.isInPlacingBetTime(roundRemainingTime) || turnTimeline.isInDisplayingResultTime(roundRemainingTime)) {
                return this.calculateTurnIndexAndId(turn, turnTimeline, roundId, roundRemainingTime, turnId);
            }
        }

        return turn;
    };

    isLastTurn = (roundRemainingTime: number, turnTimeline: TurnTimeline) => {
        return turnTimeline.turnIndex === this.totalTurn && turnTimeline.isInDisplayingResultTime(roundRemainingTime);
    };

    private calculateTurnIndexAndId(turn: Turn, turnTimeline: TurnTimeline, roundId: number, roundRemainingTime: number, turnId: number) {
        turn.index = turnTimeline.turnIndex;

        if (roundId > 0) {
            const actualRoundId = this.isLastTurn(roundRemainingTime, turnTimeline) ? roundId - 1 : roundId;
            turn.id = (actualRoundId - 1) * this.totalTurn + turn.index;
        }

        return turn;
    }
}
