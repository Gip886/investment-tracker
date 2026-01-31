import { create } from 'zustand';
import type { Transaction, Position, PortfolioSummary, PerformanceMetrics, NetValueHistory } from '../types';
import { storageUtils } from '../utils/storage';
import { calcUtils } from '../utils/calculations';

interface InvestmentStore {
  transactions: Transaction[];
  netValues: NetValueHistory[];
  initialCash: number;
  currentPrices: Map<string, number>;

  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;

  setInitialCash: (amount: number) => void;

  setCurrentPrice: (assetType: string, symbol: string, price: number) => void;

  getPortfolioSummary: () => PortfolioSummary;
  getPerformanceMetrics: () => PerformanceMetrics;
  getPositions: () => Position[];

  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  transactions: storageUtils.getTransactions(),
  netValues: storageUtils.getNetValues(),
  initialCash: storageUtils.getInitialCash(),
  currentPrices: new Map(),

  addTransaction: (transaction) => {
    const newTransaction = {
      ...transaction,
      id: calcUtils.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageUtils.addTransaction(newTransaction);
    set({ transactions: [...get().transactions, newTransaction] });
  },

  updateTransaction: (id, updates) => {
    storageUtils.updateTransaction(id, updates);
    set({
      transactions: get().transactions.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    });
  },

  deleteTransaction: (id) => {
    storageUtils.deleteTransaction(id);
    set({ transactions: get().transactions.filter(t => t.id !== id) });
  },

  setTransactions: (transactions) => {
    storageUtils.saveTransactions(transactions);
    set({ transactions });
  },

  setInitialCash: (amount) => {
    storageUtils.setInitialCash(amount);
    set({ initialCash: amount });
  },

  setCurrentPrice: (assetType, symbol, price) => {
    const currentPrices = new Map(get().currentPrices);
    currentPrices.set(`${assetType}-${symbol}`, price);
    set({ currentPrices });
  },

  getPortfolioSummary: () => {
    const { transactions, currentPrices, initialCash } = get();
    return calcUtils.calculatePortfolioSummary(transactions, currentPrices, initialCash);
  },

  getPerformanceMetrics: () => {
    const { transactions } = get();
    return calcUtils.calculatePerformance(transactions);
  },

  getPositions: () => {
    const { transactions } = get();
    return calcUtils.calculatePositions(transactions);
  },

  exportData: () => {
    return storageUtils.exportData();
  },

  importData: (jsonData) => {
    const success = storageUtils.importData(jsonData);
    if (success) {
      set({
        transactions: storageUtils.getTransactions(),
        netValues: storageUtils.getNetValues(),
        initialCash: storageUtils.getInitialCash(),
      });
    }
    return success;
  },
}));
