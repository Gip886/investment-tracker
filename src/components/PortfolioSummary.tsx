import React, { useMemo } from 'react';
import { Card, Grid } from 'antd-mobile';
import { useInvestmentStore } from '../stores/useInvestmentStore';
import { calcUtils } from '../utils/calculations';

const PortfolioSummary: React.FC = () => {
  const transactions = useInvestmentStore(state => state.transactions);
  const currentPrices = useInvestmentStore(state => state.currentPrices);
  const initialCash = useInvestmentStore(state => state.initialCash);

  const summary = useMemo(
    () => calcUtils.calculatePortfolioSummary(transactions, currentPrices, initialCash),
    [transactions, currentPrices, initialCash]
  );

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercent = (num: number): string => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const profitColor = summary.totalProfitLoss >= 0 ? '#ff6b6b' : '#4caf50';

  const metrics = useMemo(() => [
    {
      title: '总资产',
      value: `¥${formatNumber(summary.totalAssets)}`,
      desc: `成本: ¥${formatNumber(summary.totalCost)}`,
    },
    {
      title: '总盈亏',
      value: formatNumber(summary.totalProfitLoss),
      valueStyle: { color: profitColor },
      desc: formatPercent(summary.totalProfitLossPercent),
    },
    {
      title: '持仓市值',
      value: `¥${formatNumber(summary.totalAssets - summary.cash)}`,
      desc: `${summary.positions.length} 个标的`,
    },
    {
      title: '可用现金',
      value: `¥${formatNumber(summary.cash)}`,
      desc: `初始: ¥${formatNumber(initialCash)}`,
    },
  ], [summary, initialCash, profitColor]);

  return (
    <div style={{ padding: '16px' }}>
      <Grid columns={2} gap={12}>
        {metrics.map((metric, index) => (
          <Grid.Item key={index}>
            <Card
              title={metric.title}
              style={{ '--text-color': profitColor } as React.CSSProperties}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', ...metric.valueStyle }}>
                {metric.value}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {metric.desc}
              </div>
            </Card>
          </Grid.Item>
        ))}
      </Grid>
    </div>
  );
};

export default PortfolioSummary;
