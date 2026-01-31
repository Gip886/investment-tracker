import React, { useMemo } from 'react';
import { Card, List, Tag, Toast } from 'antd-mobile';
import { prompt } from '../utils/ui';
import { useInvestmentStore } from '../stores/useInvestmentStore';
import { calcUtils } from '../utils/calculations';
import { AssetType } from '../types';

const PositionList: React.FC = () => {
  const transactions = useInvestmentStore(state => state.transactions);
  const setCurrentPrice = useInvestmentStore(state => state.setCurrentPrice);

  const positions = useMemo(
    () => calcUtils.calculatePositions(transactions),
    [transactions]
  );

  const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleUpdatePrice = async (assetType: AssetType, symbol: string, name: string) => {
    const result = await prompt({
      title: '更新价格',
      content: `请输入 ${name}(${symbol}) 的当前价格`,
      placeholder: '当前价格',
    });

    if (result) {
      const price = parseFloat(result);
      if (!isNaN(price) && price > 0) {
        setCurrentPrice(assetType, symbol, price);
        Toast.show({ content: '更新成功', icon: 'success' });
      }
    }
  };

  const getAssetTypeTag = (type: AssetType) => {
    const tags = {
      [AssetType.STOCK]: { color: 'primary', text: '股票' },
      [AssetType.FUND]: { color: 'success', text: '基金' },
      [AssetType.BOND]: { color: 'warning', text: '固收' },
      [AssetType.OTHER]: { color: 'default', text: '其他' },
    };
    const tag = tags[type] || tags[AssetType.OTHER];
    return <Tag color={tag.color}>{tag.text}</Tag>;
  };

  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
  }, [positions]);

  return (
    <div style={{ padding: '16px' }}>
      <Card title={`持仓列表 (${sortedPositions.length})`}>
        <List>
          {sortedPositions.map((position, index) => (
            <List.Item
              key={index}
              onClick={() => handleUpdatePrice(position.assetType, position.symbol, position.name)}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '8px' }}>
                      {position.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {position.symbol}
                    </span>
                  </div>
                  {getAssetTypeTag(position.assetType)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#999' }}>持仓: </span>
                    {position.quantity.toFixed(2)}
                  </div>
                  <div>
                    <span style={{ color: '#999' }}>成本价: </span>
                    ¥{formatNumber(position.costPrice)}
                  </div>
                  <div>
                    <span style={{ color: '#999' }}>现价: </span>
                    ¥{formatNumber(position.currentPrice || position.costPrice)}
                  </div>
                  <div>
                    <span style={{ color: '#999' }}>市值: </span>
                    ¥{formatNumber(position.marketValue || 0)}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#999' }}>盈亏: </span>
                    <span style={{ color: (position.profitLoss || 0) >= 0 ? '#ff6b6b' : '#4caf50', fontWeight: 'bold' }}>
                      ¥{formatNumber(position.profitLoss || 0)} ({position.profitLossPercent?.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </List.Item>
          ))}

          {sortedPositions.length === 0 && (
            <List.Item>
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无持仓
              </div>
            </List.Item>
          )}
        </List>
      </Card>
    </div>
  );
};

export default PositionList;
