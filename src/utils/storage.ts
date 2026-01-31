import type { Transaction, NetValueHistory } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'investment_transactions',
  NET_VALUES: 'investment_net_values',
  INITIAL_CASH: 'investment_initial_cash',
};

export const storageUtils = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveTransactions: (transactions: Transaction[]): void => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = storageUtils.getTransactions();
    transactions.push(transaction);
    storageUtils.saveTransactions(transactions);
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): void => {
    const transactions = storageUtils.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates, updatedAt: new Date().toISOString() };
      storageUtils.saveTransactions(transactions);
    }
  },

  deleteTransaction: (id: string): void => {
    const transactions = storageUtils.getTransactions().filter(t => t.id !== id);
    storageUtils.saveTransactions(transactions);
  },

  getNetValues: (): NetValueHistory[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NET_VALUES);
    return data ? JSON.parse(data) : [];
  },

  saveNetValues: (netValues: NetValueHistory[]): void => {
    localStorage.setItem(STORAGE_KEYS.NET_VALUES, JSON.stringify(netValues));
  },

  getInitialCash: (): number => {
    const data = localStorage.getItem(STORAGE_KEYS.INITIAL_CASH);
    return data ? parseFloat(data) : 0;
  },

  setInitialCash: (amount: number): void => {
    localStorage.setItem(STORAGE_KEYS.INITIAL_CASH, amount.toString());
  },

  exportData: (): string => {
    return JSON.stringify({
      transactions: storageUtils.getTransactions(),
      netValues: storageUtils.getNetValues(),
      initialCash: storageUtils.getInitialCash(),
      exportDate: new Date().toISOString(),
    }, null, 2);
  },

  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.transactions) storageUtils.saveTransactions(data.transactions);
      if (data.netValues) storageUtils.saveNetValues(data.netValues);
      if (data.initialCash !== undefined) storageUtils.setInitialCash(data.initialCash);
      return true;
    } catch {
      return false;
    }
  },
};
