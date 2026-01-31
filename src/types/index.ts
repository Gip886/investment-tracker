// 交易类型
export const TransactionType = {
  BUY: 'buy',           // 买入
  SELL: 'sell',         // 卖出
  DIVIDEND: 'dividend', // 分红
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

// 资产类型
export const AssetType = {
  STOCK: 'stock',       // 股票
  FUND: 'fund',         // 基金
  BOND: 'bond',         // 债券/固收
  OTHER: 'other',       // 其他
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];

// 交易记录
export interface Transaction {
  id: string;
  date: string;          // ISO 8601 格式
  assetType: AssetType;
  symbol: string;        // 代码
  name: string;          // 名称
  type: TransactionType;
  price: number;         // 单价
  quantity: number;      // 数量
  fee: number;           // 手续费
  amount?: number;       // 金额（买入/卖出时自动计算）
  note?: string;         // 备注
  createdAt: string;
  updatedAt: string;
}

// 持仓信息
export interface Position {
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: number;      // 持仓数量
  costPrice: number;     // 成本价
  costAmount: number;    // 成本金额（含手续费）
  currentPrice?: number; // 当前价格（需要手动输入或API获取）
  marketValue?: number;  // 市值
  profitLoss?: number;   // 盈亏金额
  profitLossPercent?: number; // 盈亏比例
}

// 收益统计
export interface PortfolioSummary {
  totalAssets: number;   // 总资产
  totalCost: number;     // 总成本
  totalProfitLoss: number; // 总盈亏
  totalProfitLossPercent: number; // 总收益率
  positions: Position[]; // 持仓列表
  cash: number;          // 可用现金
}

// 绩效指标
export interface PerformanceMetrics {
  totalReturn: number;           // 总收益率
  annualizedReturn: number;      // 年化收益率
  maxDrawdown: number;           // 最大回撤
  winRate: number;               // 胜率
  profitLossRatio: number;       // 盈亏比
  totalTrades: number;           // 总交易次数
  profitableTrades: number;      // 盈利交易次数
  averageProfit: number;         // 平均盈利
  averageLoss: number;           // 平均亏损
}

// 日期范围
export interface DateRange {
  start: string;
  end: string;
}

// 净值历史记录（用于计算收益曲线）
export interface NetValueHistory {
  date: string;
  netValue: number;      // 净值
  totalAssets: number;   // 总资产
}
