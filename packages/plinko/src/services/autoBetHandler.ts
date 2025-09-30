import { toast } from 'react-toastify';

export interface AutoBetConfig {
    numberOfBets: number;
    onWinAction: 'Reset' | 'Increase';
    onWinPercentage: number;
    onLossAction: 'Reset' | 'Increase';
    onLossPercentage: number;
    stopOnWin: number;
    stopOnLoss: number;
    initialBetAmount: number;
    gameMode: number;
    numberOfRows: number;
}

export interface BetResult {
    win: boolean;
    payout: number;
    betAmount: number;
}

export interface AutoBetHandlerCallbacks {
    onBetPlaced: (betAmount: number) => void;
    onBetResult: (result: BetResult) => void;
    onAutoBetComplete: (reason: string) => void;
    onBalanceUpdate: (newBalance: number) => void;
}

export class AutoBetHandler {
    private config: AutoBetConfig;
    private callbacks: AutoBetHandlerCallbacks;
    private isRunning = false;
    private currentBetAmount: number;
    private remainingBets: number;
    private totalNetProfit = 0;
    private currentBalance: number;
    private placeBetFn: (amount: number, gameMode: number, numberOfRows: number) => void;

    constructor(
        config: AutoBetConfig,
        initialBalance: number,
        placeBetFn: (amount: number, gameMode: number, numberOfRows: number) => void,
        callbacks: AutoBetHandlerCallbacks
    ) {
        this.config = config;
        this.currentBalance = initialBalance;
        this.placeBetFn = placeBetFn;
        this.callbacks = callbacks;
        this.currentBetAmount = config.initialBetAmount;
        this.remainingBets = config.numberOfBets;
    }

    start(): void {
        console.log('AutoBetHandler: start() called', { isRunning: this.isRunning });
        if (this.isRunning) {
            console.log('AutoBetHandler: Already running, returning');
            return;
        }

        this.isRunning = true;
        this.remainingBets = this.config.numberOfBets;
        this.totalNetProfit = 0;
        this.currentBetAmount = this.config.initialBetAmount;

        console.log('AutoBetHandler: Starting auto bet session:', {
            numberOfBets: this.config.numberOfBets,
            initialBetAmount: this.config.initialBetAmount,
            gameMode: this.config.gameMode,
            numberOfRows: this.config.numberOfRows
        });

        this.placeNextBet();
    }

    stop(): void {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        console.log('Auto bet stopped manually');
        this.callbacks.onAutoBetComplete('stopped_manually');
    }

    processBetResult(result: BetResult): void {
        if (!this.isRunning) {
            return;
        }

        const { win, payout, betAmount } = result;
        const netProfit = payout - betAmount;

        // Update total net profit and balance
        this.totalNetProfit += netProfit;
        this.currentBalance += netProfit;
        this.callbacks.onBalanceUpdate(this.currentBalance);

        console.log('Bet result processed:', {
            win,
            payout,
            betAmount,
            netProfit,
            totalNetProfit: this.totalNetProfit,
            remainingBets: this.remainingBets - 1
        });

        // Check stop conditions
        const shouldStopOnWin = this.config.stopOnWin > 0 && this.totalNetProfit >= this.config.stopOnWin;
        const shouldStopOnLoss = this.config.stopOnLoss > 0 && this.totalNetProfit <= -Math.abs(this.config.stopOnLoss);
        const insufficientBalance = this.currentBalance < this.currentBetAmount;
        const betsCompleted = this.remainingBets <= 1;

        if (shouldStopOnWin) {
            this.isRunning = false;
            toast.success(`Auto bet stopped - Target profit reached: $${this.totalNetProfit.toFixed(2)}`);
            this.callbacks.onAutoBetComplete('stop_on_win');
            return;
        }

        if (shouldStopOnLoss) {
            this.isRunning = false;
            toast.error(`Auto bet stopped - Loss limit reached: $${this.totalNetProfit.toFixed(2)}`);
            this.callbacks.onAutoBetComplete('stop_on_loss');
            return;
        }

        if (insufficientBalance) {
            this.isRunning = false;
            toast.error(`Auto bet stopped - Insufficient balance: $${this.currentBalance.toFixed(2)}`);
            this.callbacks.onAutoBetComplete('insufficient_balance');
            return;
        }

        if (betsCompleted) {
            this.isRunning = false;
            toast.success(`Auto bet completed - Total profit: $${this.totalNetProfit.toFixed(2)}`);
            this.callbacks.onAutoBetComplete('bets_completed');
            return;
        }

        // Adjust bet amount based on win/loss actions
        this.adjustBetAmount(win);

        // Decrement remaining bets
        this.remainingBets--;

        // Notify of bet result
        this.callbacks.onBetResult(result);

        // Continue with next bet after a short delay
        setTimeout(() => {
            if (this.isRunning) {
                this.placeNextBet();
            }
        }, 1500); // 1.5 second delay between bets
    }

    private adjustBetAmount(win: boolean): void {
        let newBetAmount = this.currentBetAmount;

        if (win && this.config.onWinAction === 'Increase') {
            // On Win: Next bet = current bet * (1 + percentage/100)
            newBetAmount = Math.floor(this.currentBetAmount * (1 + this.config.onWinPercentage / 100));
        } else if (!win && this.config.onLossAction === 'Increase') {
            // On Loss: Next bet = current bet * (1 + percentage/100)
            newBetAmount = Math.floor(this.currentBetAmount * (1 + this.config.onLossPercentage / 100));
        } else if ((win && this.config.onWinAction === 'Reset') || (!win && this.config.onLossAction === 'Reset')) {
            // Reset to initial bet amount
            newBetAmount = this.config.initialBetAmount;
        }

        // Ensure bet amount doesn't exceed reasonable max (assuming 1000 for now)
        const maxBet = 1000;
        newBetAmount = Math.min(newBetAmount, maxBet);

        // Ensure we have enough balance
        newBetAmount = Math.min(newBetAmount, this.currentBalance);

        this.currentBetAmount = newBetAmount;
    }

    private placeNextBet(): void {
        console.log('AutoBetHandler: placeNextBet() called', { isRunning: this.isRunning, remainingBets: this.remainingBets });

        if (!this.isRunning || this.remainingBets <= 0) {
            console.log('AutoBetHandler: Not placing bet - stopping condition met', { isRunning: this.isRunning, remainingBets: this.remainingBets });
            return;
        }

        console.log(`AutoBetHandler: Placing auto bet ${this.config.numberOfBets - this.remainingBets + 1}/${this.config.numberOfBets}:`, {
            amount: this.currentBetAmount,
            gameMode: this.config.gameMode,
            numberOfRows: this.config.numberOfRows,
            remainingBets: this.remainingBets,
            clientSeed: 'handled-by-pf-system' // clientSeed is now handled by shared PF system
        });

        // Notify that bet is being placed
        this.callbacks.onBetPlaced(this.currentBetAmount);

        // Place the bet (clientSeed is handled by shared PF system)
        console.log('AutoBetHandler: Calling placeBetFn');
        this.placeBetFn(this.currentBetAmount, this.config.gameMode, this.config.numberOfRows);
    }

    isActive(): boolean {
        return this.isRunning;
    }

    getCurrentStats(): {
        remainingBets: number;
        currentBetAmount: number;
        totalNetProfit: number;
        currentBalance: number;
    } {
        return {
            remainingBets: this.remainingBets,
            currentBetAmount: this.currentBetAmount,
            totalNetProfit: this.totalNetProfit,
            currentBalance: this.currentBalance
        };
    }
}
