import { numberWithCommas } from '@shared/helpers';

export const displayWinAmount = (win: number): string => {
  return numberWithCommas(win, 2);
}

export const formatNumber = (value: number): string => numberWithCommas(value, 2);

export const calculateTotalStake = (betLogDetails: any[], produceRow: Function, drawInfo: any): number =>
  betLogDetails.reduce((sum, detail) => sum + produceRow(detail, drawInfo).amount, 0);

export const calculateTotalWinFromTable = (data: any[]): number =>
  data
    .filter(row => row.isWinningBet)
    .reduce((sum, row) => {
      const winValue = parseFloat(row.win?.toString().replace(/[^\d.-]/g, "") ?? "0");
      return sum + winValue;
    }, 0);
