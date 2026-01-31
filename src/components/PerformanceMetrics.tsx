import React, { useMemo } from 'react';
import { Card, Grid } from 'antd-mobile';
import { useInvestmentStore } from '../stores/useInvestmentStore';
import { calcUtils } from '../utils/calculations';

const PerformanceMetrics: React.FC = () => {
  const transactions = useInvestmentStore(state => state.transactions);

  const metrics = useMemo(
    () => calcUtils.calculatePerformance(transactions),
    [transactions]
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

  const data = useMemo(() => [
    { title: '总收益率', value: formatPercent(metrics.totalReturn), color: metrics.totalReturn >= 0 ? '#ff6b6b' : '#4caf50' },
    { title: '年化收益', value: formatPercent(metrics.annualizedReturn), color: metrics.annualizedReturn >= 0 ? '#ff6b6b' : '#4caf50' },
    { title: '最大回撤', value: formatPercent(metrics.maxDrawdown), color: '#999' },
    { title: '胜率', value: formatPercent(metrics.winRate), color: metrics.winRate >= 50 ? '#ff6b6b' : '#4caf50' },
    { title: '盈亏比', value: metrics.profitLossRatio.toFixed(2), color: metrics.profitLossRatio >= 1 ? '#ff6b6b' : '#999' },
    { title: '交易次数', value: metrics.totalTrades.toString(), color: '#666' },
    { title: '盈利次数', value: metrics.profitableTrades.toString(), color: '#ff6b6b' },
    { title: '平均盈利', value: `¥${formatNumber(metrics.averageProfit)}`, color: '#ff6b6b' },
    { title: '平均亏损', value: `¥${formatNumber(metrics.averageLoss)}`, color: '#4caf50' },
  ], [metrics]);

  return (
    <div style={{ padding: '16px' }}>
      <Card title="绩效分析">
        <Grid columns={3} gap={12}>
          {data.map((item, index) => (
            <Grid.Item key={index}>
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: item.color }}>
                  {item.value}
                </div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
