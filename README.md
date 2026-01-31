# 投资收益统计跟踪应用

移动端优先的单页面应用，用于管理和分析个人投资组合。

## 功能特性

- 📊 投资组合管理：支持股票、基金、债券等多种资产类型
- 💰 交易记录：买入、卖出、分红等交易类型
- 📈 收益分析：实时计算持仓收益、总收益率等关键指标
- 📉 绩效图表：使用 ECharts 可视化投资绩效
- 💾 本地存储：数据保存在浏览器本地，无需服务器

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **UI 组件库**: antd-mobile (移动端优化)
- **图表库**: ECharts + echarts-for-react
- **日期处理**: dayjs
- **路由**: react-router-dom

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动开发服务器，默认访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

执行 TypeScript 编译和 Vite 生产构建，输出到 `dist` 目录。

### 预览构建

```bash
npm run preview
```

本地预览生产构建结果。

### 代码检查

```bash
npm run lint
```

使用 ESLint 进行代码质量检查。

## 项目结构

```
src/
├── components/          # React 组件
│   ├── PerformanceChart.tsx      # 绩效图表
│   ├── PerformanceMetrics.tsx    # 绩效指标
│   ├── PortfolioSummary.tsx      # 投资组合摘要
│   ├── PositionList.tsx          # 持仓列表
│   └── TransactionForm.tsx       # 交易表单
├── pages/              # 页面组件
│   └── HomePage.tsx    # 首页
├── stores/             # Zustand 状态管理
│   └── useInvestmentStore.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   ├── calculations.ts # 收益计算逻辑
│   ├── storage.ts      # 本地存储封装
│   └── ui.tsx          # UI 工具函数
├── App.tsx             # 应用根组件
└── main.tsx            # 应用入口
```

## 核心概念

### 数据流

```
localStorage <-> useInvestmentStore <-> 组件
                        |
              calculations.ts (计算逻辑)
```

### 关键类型

- `TransactionType`: 交易类型 (buy | sell | dividend)
- `AssetType`: 资产类型 (stock | fund | bond | other)
- `Transaction`: 交易记录
- `Position`: 持仓信息
- `PortfolioSummary`: 投资组合摘要
- `PerformanceMetrics`: 绩效指标

### 状态管理最佳实践

使用 Zustand 时，组件中应该使用 selector 选择原始状态数据，然后用 `useMemo` 调用计算函数：

```typescript
// ✅ 正确做法
const transactions = useInvestmentStore(state => state.transactions);
const summary = useMemo(() =>
  calcUtils.calculatePortfolioSummary(transactions, ...),
  [transactions, ...]
);

// ❌ 错误做法 - 会导致 React 19 下的无限循环
const summary = useInvestmentStore(state => state.getPortfolioSummary());
```

## 开发说明

- 所有持仓、收益、绩效计算逻辑集中在 `utils/calculations.ts`
- 数据持久化通过 `utils/storage.ts` 封装的 localStorage 实现
- 项目采用移动端优先设计，使用 antd-mobile 组件库
- 暂无测试框架配置

## 许可证

Private
