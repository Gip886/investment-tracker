import dayjs from 'dayjs';
import { TransactionType } from '../types';
import type { Transaction, Position, PortfolioSummary, PerformanceMetrics, NetValueHistory } from '../types';

export const calcUtils = {
  generateId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  calculatePositions: (transactions: Transaction[]): Position[] => {
    const positionMap = new Map<string, Position>();

    transactions.forEach(t => {
      const key = `${t.assetType}-${t.symbol}`;

      if (!positionMap.has(key)) {
        positionMap.set(key, {
          symbol: t.symbol,
          name: t.name,
          assetType: t.assetType,
          quantity: 0,
          costPrice: 0,
          costAmount: 0,
        });
      }

      const position = positionMap.get(key)!;

      if (t.type === TransactionType.BUY) {
        const amount = t.price * t.quantity + t.fee;
        position.quantity += t.quantity;
        position.costAmount += amount;
      } else if (t.type === TransactionType.SELL) {
        const sellRatio = t.quantity / position.quantity;
        position.costAmount -= position.costAmount * sellRatio;
        position.quantity -= t.quantity;
        position.costAmount -= t.fee;
      } else if (t.type === TransactionType.DIVIDEND) {
        position.costAmount -= t.amount || t.price;
      }

      if (position.quantity > 0) {
        position.costPrice = position.costAmount / position.quantity;
      }
    });

    return Array.from(positionMap.values()).filter(p => p.quantity > 0);
  },

  calculatePortfolioSummary: (
    transactions: Transaction[],
    currentPrices: Map<string, number>,
    cash: number = 0
  ): PortfolioSummary => {
    const positions = calcUtils.calculatePositions(transactions);

    let totalMarketValue = 0;
    let totalCost = 0;

    positions.forEach(p => {
      const currentPrice = currentPrices.get(`${p.assetType}-${p.symbol}`) || p.costPrice;
      p.currentPrice = currentPrice;
      p.marketValue = currentPrice * p.quantity;
      p.profitLoss = p.marketValue - p.costAmount;
      p.profitLossPercent = (p.profitLoss / p.costAmount) * 100;

      totalMarketValue += p.marketValue;
      totalCost += p.costAmount;
    });

    const totalAssets = totalMarketValue + cash;
    const totalProfitLoss = totalMarketValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      totalAssets,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      positions,
      cash,
    };
  },

  calculatePerformance: (transactions: Transaction[]): PerformanceMetrics => {
    const buyTransactions = transactions.filter(t => t.type === TransactionType.BUY);
    const sellTransactions = transactions.filter(t => t.type === TransactionType.SELL);

    let totalProfit = 0;
    let totalLoss = 0;
    let profitableTrades = 0;

    const sellMap = new Map<string, typeof sellTransactions>();

    sellTransactions.forEach(s => {
      const key = s.symbol;
      if (!sellMap.has(key)) {
        sellMap.set(key, []);
      }
      sellMap.get(key)!.push(s);
    });

    sellTransactions.forEach(sell => {
      const relatedBuys = buyTransactions.filter(
        b => b.symbol === sell.symbol && dayjs(b.date).isBefore(sell.date)
      );

      if (relatedBuys.length > 0) {
        const buy = relatedBuys[0];
        const profit = (sell.price - buy.price) * sell.quantity - sell.fee - buy.fee;

        if (profit > 0) {
          totalProfit += profit;
          profitableTrades++;
        } else {
          totalLoss += Math.abs(profit);
        }
      }
    });

    const totalTrades = sellTransactions.length;
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
    const averageProfit = profitableTrades > 0 ? totalProfit / profitableTrades : 0;
    const losingTrades = totalTrades - profitableTrades;
    const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
    const profitLossRatio = averageLoss > 0 ? averageProfit / averageLoss : 0;

    const firstTransaction = transactions[0];
    const lastTransaction = transactions[transactions.length - 1];

    const initialAmount = transactions
      .filter(t => t.type === TransactionType.BUY)
      .reduce((sum, t) => sum + t.price * t.quantity + t.fee, 0);

    const finalAmount = transactions
      .filter(t => t.type === TransactionType.SELL)
      .reduce((sum, t) => sum + t.price * t.quantity - t.fee, 0);

    const totalReturn = initialAmount > 0 ? ((finalAmount - initialAmount) / initialAmount) * 100 : 0;

    const daysHeld = firstTransaction && lastTransaction
      ? dayjs(lastTransaction.date).diff(dayjs(firstTransaction.date), 'day')
      : 1;

    const annualizedReturn = daysHeld > 0
      ? (Math.pow(1 + totalReturn / 100, 365 / daysHeld) - 1) * 100
      : 0;

    return {
      totalReturn,
      annualizedReturn,
      maxDrawdown: 0,
      winRate,
      profitLossRatio,
      totalTrades,
      profitableTrades,
      averageProfit,
      averageLoss,
    };
  },

  calculateMaxDrawdown: (netValues: NetValueHistory[]): number => {
    if (netValues.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = netValues[0].netValue;

    for (let i = 1; i < netValues.length; i++) {
      const currentValue = netValues[i].netValue;

      if (currentValue > peak) {
        peak = currentValue;
      }

      const drawdown = ((peak - currentValue) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  },

  groupTransactionsByDate: (transactions: Transaction[]): Map<string, Transaction[]> => {
    const grouped = new Map<string, Transaction[]>();

    transactions.forEach(t => {
      const dateKey = dayjs(t.date).format('YYYY-MM-DD');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(t);
    });

    return grouped;
  },
};
