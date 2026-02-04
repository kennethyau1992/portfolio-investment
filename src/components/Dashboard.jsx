// Portfolio Dashboard with margin account equity support
import React, { useState, useEffect } from 'react';
import PortfolioTable from './PortfolioTable';
import AllocationChart from './AllocationChart';
import { calculateRebalancing } from '../utils/rebalancing';
import { fetchStockPrices } from '../api/stockPrices';
import portfolioData from '../data/portfolio.json';

const Dashboard = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartMode, setChartMode] = useState('current');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const symbols = portfolioData.holdings.map(h => h.code);
        const currentPrices = await fetchStockPrices(symbols);

        const totalValue = portfolioData.holdings.reduce((sum, h) => {
          return sum + (h.actualQuantity * currentPrices[h.code]);
        }, 0);

        const marginDebt = portfolioData.marginDebt || 0;
        const accountEquity = totalValue - marginDebt;

        const processedData = calculateRebalancing(
          portfolioData.holdings,
          currentPrices,
          totalValue,
          accountEquity
        );

        setHoldings(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalTargetValue = holdings.reduce((sum, h) => sum + h.targetValue, 0);
  const totalProfit = holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  const needsRebalance = holdings.some(h => h.needsRebalancing);
  const marginDebt = portfolioData.marginDebt || 0;
  const accountEquity = totalCurrentValue - marginDebt;
  const leverageRatio = accountEquity > 0 ? totalCurrentValue / accountEquity : 1;

  if (loading) {
    return <div className="loading">Loading portfolio data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Portfolio Dashboard</h1>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Account Equity</h3>
            <p className="value">{formatCurrency(accountEquity)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Value</h3>
            <p className="value">{formatCurrency(totalCurrentValue)}</p>
          </div>
          <div className="summary-card">
            <h3>Margin Debt</h3>
            <p className="value">{formatCurrency(marginDebt)}</p>
            <small>Leverage: {leverageRatio.toFixed(2)}x</small>
          </div>
          <div className="summary-card">
            <h3>Total Target</h3>
            <p className="value">{formatCurrency(totalTargetValue)}</p>
          </div>
          <div className={`summary-card ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
            <h3>Profit/Loss</h3>
            <p className="value">{formatCurrency(totalProfit)}</p>
          </div>
          <div className={`summary-card ${needsRebalance ? 'warning' : 'ok'}`}>
            <h3>Rebalance Status</h3>
            <p className="value">{needsRebalance ? 'Needed' : 'OK'}</p>
          </div>
        </div>
      </header>

      <div className="chart-section">
        <div className="chart-controls">
          <button 
            className={chartMode === 'current' ? 'active' : ''}
            onClick={() => setChartMode('current')}
          >
            Current Allocation
          </button>
          <button 
            className={chartMode === 'target' ? 'active' : ''}
            onClick={() => setChartMode('target')}
          >
            Target Allocation
          </button>
        </div>
        <AllocationChart data={holdings} mode={chartMode} />
      </div>

      <div className="table-section">
        <h2>Portfolio Holdings</h2>
        <PortfolioTable data={holdings} />
      </div>

      <div className="info-section">
        <h3>Rebalancing Strategy: 5/25 Band Rule</h3>
        <ul>
          <li>Absolute 5%: If allocation drifts by ±5 percentage points, rebalance</li>
          <li>Relative 25%: If allocation drifts by ±25% of its target, rebalance</li>
          <li>The more restrictive band is applied</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
