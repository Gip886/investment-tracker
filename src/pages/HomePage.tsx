import React, { useState } from 'react';
import { Tabs, NavBar, Dialog, Toast } from 'antd-mobile';
import { DeleteOutline } from 'antd-mobile-icons';
import { prompt } from '../utils/ui';
import TransactionForm from '../components/TransactionForm';
import PortfolioSummary from '../components/PortfolioSummary';
import PositionList from '../components/PositionList';
import PerformanceMetrics from '../components/PerformanceMetrics';
import PerformanceChart from '../components/PerformanceChart';
import { useInvestmentStore } from '../stores/useInvestmentStore';
import dayjs from 'dayjs';

const HomePage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('summary');

  return (
    <div>
      <NavBar back={null}>投资收益统计</NavBar>

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        style={{ '--title-font-size': '15px' }}
      >
        <Tabs.Tab title="总览" key="summary">
          <PortfolioSummary />
          <PerformanceChart />
        </Tabs.Tab>

        <Tabs.Tab title="持仓" key="positions">
          <PositionList />
        </Tabs.Tab>

        <Tabs.Tab title="绩效" key="performance">
          <PerformanceMetrics />
        </Tabs.Tab>

        <Tabs.Tab title="交易" key="transactions">
          <TransactionList />
        </Tabs.Tab>

        <Tabs.Tab title="添加" key="add">
          <TransactionForm />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, exportData, importData, setInitialCash, initialCash } = useInvestmentStore();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment-data-${dayjs().format('YYYYMMDD-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show({ content: '导出成功', icon: 'success' });
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          if (importData(data)) {
            Toast.show({ content: '导入成功', icon: 'success' });
          } else {
            Toast.show({ content: '导入失败，文件格式错误', icon: 'fail' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSetCash = async () => {
    const result = await prompt({
      title: '设置可用现金',
      content: '请输入当前可用现金金额',
      defaultValue: initialCash.toString(),
      placeholder: '金额',
    });
    if (result) {
      const cash = parseFloat(result);
      if (!isNaN(cash) && cash >= 0) {
        setInitialCash(cash);
        Toast.show({ content: '设置成功', icon: 'success' });
      }
    }
  };

  const handleDelete = async (id: string, symbol: string) => {
    const result = await Dialog.confirm({
      content: `确认删除 ${symbol} 的这条交易记录？`,
    });
    if (result) {
      deleteTransaction(id);
      Toast.show({ content: '删除成功', icon: 'success' });
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTypeTag = (type: string) => {
    const tags = {
      buy: { text: '买入', color: 'primary' },
      sell: { text: '卖出', color: 'success' },
      dividend: { text: '分红', color: 'warning' },
    };
    return tags[type as keyof typeof tags] || { text: type, color: 'default' };
  };

  const sortedTransactions = [...transactions].sort((a, b) =>
    dayjs(b.date).unix() - dayjs(a.date).unix()
  );

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleSetCash}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          设置现金
        </button>
        <button
          onClick={handleExport}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          导出数据
        </button>
        <button
          onClick={handleImport}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          导入数据
        </button>
      </div>

      <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
        共 {transactions.length} 条记录
      </div>

      {sortedTransactions.map((t) => {
        const tag = getTypeTag(t.type);
        const isBuy = t.type === 'buy';
        const amount = t.price * t.quantity;
        const displayAmount = t.type === 'dividend' ? t.amount || t.price : amount;
        const totalAmount = isBuy ? amount + t.fee : amount - t.fee;

        return (
          <div
            key={t.id}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              border: '1px solid #eee',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: tag.color === 'primary' ? '#e6f7ff' : tag.color === 'success' ? '#f6ffed' : '#fff7e6',
                  color: tag.color === 'primary' ? '#1890ff' : tag.color === 'success' ? '#52c41a' : '#fa8c16',
                }}>
                  {tag.text}
                </span>
                <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>{t.symbol}</span>
              </div>
              <DeleteOutline onClick={() => handleDelete(t.id, t.name)} style={{ color: '#999', cursor: 'pointer' }} />
            </div>

            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>日期: {dayjs(t.date).format('YYYY-MM-DD')}</div>
              <div>价格: ¥{formatNumber(t.price)} × {t.quantity}</div>
              <div>手续费: ¥{formatNumber(t.fee)}</div>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: isBuy ? '#ff6b6b' : '#4caf50',
                marginTop: '4px',
              }}>
                {isBuy ? '-' : '+'}¥{formatNumber(Math.abs(totalAmount))}
              </div>
            </div>
          </div>
        );
      })}

      {sortedTransactions.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          暂无交易记录
        </div>
      )}
    </div>
  );
};

export default HomePage;
