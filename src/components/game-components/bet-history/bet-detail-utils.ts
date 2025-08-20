import { numberWithCommas } from "../../../_shared/helpers";

export const calculateWinAmount = (amount: number, odds: number, win: number): number => {
  return win > 0 ? amount * odds : win - amount;
};

export const formatNumber = (value: number): string => numberWithCommas(value, 2);

export const calculateTotalStake = (betLogDetails: any[], produceRow: Function, drawInfo: any): number =>
  betLogDetails.reduce((sum, detail) => sum + produceRow(detail, drawInfo).amount, 0);

export const calculateNetProfit = (betLogDetails: any[], produceRow: Function, drawInfo: any): number =>
  betLogDetails.reduce((sum, detail) => {
    const { win, amount, odds } = produceRow(detail, drawInfo);
    return sum + calculateWinAmount(amount, odds, win);
  }, 0);

export const calculateTotalWinFromTable = (data: any[]): number =>
  data
    .filter(row => row.isWinningBet)
    .reduce((sum, row) => {
      const winValue = parseFloat(row.win?.toString().replace(/[^\d.-]/g, "") ?? "0");
      return sum + winValue;
    }, 0);
