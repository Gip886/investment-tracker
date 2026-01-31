import React, { useState } from 'react';
import { Form, Input, TextArea, Selector, Button, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useInvestmentStore } from '../stores/useInvestmentStore';
import { TransactionType, AssetType } from '../types';

const SingleSelector = ({ value, onChange, options }: any) => {
  return (
    <Selector
      options={options}
      value={value ? [value] : []}
      onChange={v => onChange?.(v[0])}
      columns={3}
    />
  );
};

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm();
  const addTransaction = useInvestmentStore(state => state.addTransaction);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    const price = Number(values.price);
    const quantity = Number(values.quantity);
    const amount = values.type === TransactionType.DIVIDEND
      ? price
      : price * quantity;

    const transaction = {
      date: values.date, // Input type='date' returns string YYYY-MM-DD
      assetType: values.assetType,
      symbol: values.symbol.toUpperCase(),
      name: values.name,
      type: values.type,
      price: price,
      quantity: values.type === TransactionType.DIVIDEND ? 0 : quantity,
      fee: Number(values.fee || 0),
      amount,
      note: values.note,
    };

    addTransaction(transaction as any); // Cast to any to avoid strict type checks on id/dates for now
    Toast.show({ content: '添加成功', icon: 'success' });
    form.resetFields();
    setLoading(false);
  };

  return (
    <div style={{ padding: '16px' }}>
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleSubmit}
        footer={
          <Button
            block
            type="submit"
            color="primary"
            size="large"
            loading={loading}
            onClick={() => form.submit()}
          >
            添加交易
          </Button>
        }
      >
        <Form.Header>添加交易记录</Form.Header>

        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '请选择日期' }]}
          initialValue={dayjs().format('YYYY-MM-DD')}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
          initialValue={TransactionType.BUY}
        >
          <SingleSelector
            options={[
              { label: '买入', value: TransactionType.BUY },
              { label: '卖出', value: TransactionType.SELL },
              { label: '分红', value: TransactionType.DIVIDEND },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="assetType"
          label="资产类型"
          rules={[{ required: true, message: '请选择资产类型' }]}
          initialValue={AssetType.STOCK}
        >
          <SingleSelector
            options={[
              { label: '股票', value: AssetType.STOCK },
              { label: '基金', value: AssetType.FUND },
              { label: '固收', value: AssetType.BOND },
              { label: '其他', value: AssetType.OTHER },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="symbol"
          label="代码"
          rules={[{ required: true, message: '请输入代码' }]}
        >
          <Input placeholder="如: 600519" />
        </Form.Item>

        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="如: 贵州茅台" />
        </Form.Item>

        <Form.Item
          name="price"
          label="单价"
          rules={[{ required: true, message: '请输入单价' }]}
        >
          <Input type="number" placeholder="0.00" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
          {({ getFieldValue }) =>
            getFieldValue('type') !== TransactionType.DIVIDEND ? (
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <Input type="number" placeholder="0" style={{ width: '100%' }} />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          name="fee"
          label="手续费"
          initialValue={0}
        >
          <Input type="number" placeholder="0.00" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="note" label="备注">
          <TextArea placeholder="可选" rows={2} maxLength={100} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default TransactionForm;
