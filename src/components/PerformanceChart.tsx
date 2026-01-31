import React, { useMemo } from 'react';
import { Card } from 'antd-mobile';
import ReactECharts from 'echarts-for-react';
import { useInvestmentStore } from '../stores/useInvestmentStore';
import dayjs from 'dayjs';
import { TransactionType } from '../types';

const PerformanceChart: React.FC = () => {
  const transactions = useInvestmentStore(state => state.transactions);

  const chartData = useMemo(() => {
    if (transactions.length === 0) return null;

    const grouped = new Map<string, number>();

    transactions.forEach(t => {
      const dateKey = dayjs(t.date).format('YYYY-MM-DD');
      const amount = t.type === TransactionType.BUY
        ? -(t.price * t.quantity + t.fee)
        : t.type === TransactionType.SELL
          ? t.price * t.quantity - t.fee
          : t.amount || t.price;

      grouped.set(dateKey, (grouped.get(dateKey) || 0) + amount);
    });

    const sortedDates = Array.from(grouped.keys()).sort();
    let cumulative = 0;
    const data = sortedDates.map(date => {
      cumulative += grouped.get(date) || 0;
      return [date, cumulative];
    });

    return data;
  }, [transactions]);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>累计收益: ¥${param.value[1]?.toFixed(2) || '0.00'}`;
      },
    },
    grid: {
      left: '60px',
      right: '20px',
      top: '20px',
      bottom: '30px',
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: string) => dayjs(value).format('MM-DD'),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`,
      },
    },
    series: [{
      type: 'line',
      smooth: true,
      data: chartData || [],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
            { offset: 1, color: 'rgba(255, 107, 107, 0.05)' },
          ],
        },
      },
      lineStyle: {
        color: '#ff6b6b',
        width: 2,
      },
      itemStyle: {
        color: '#ff6b6b',
      },
    }],
  }), [chartData]);

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ padding: '16px' }}>
        <Card title="收益曲线">
          <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
            暂无数据，请先添加交易记录
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <Card title="收益曲线">
        <ReactECharts option={option} style={{ height: '250px' }} />
      </Card>
    </div>
  );
};

export default PerformanceChart;
