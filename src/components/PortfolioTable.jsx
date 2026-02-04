import React from 'react';

const PortfolioTable = ({ data, fineTuneThreshold }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="portfolio-table-container">
      <table className="portfolio-table">
        <thead>
          <tr>
            <th>Bucket</th>
            <th>Code</th>
            <th>Name</th>
            <th>Target</th>
            <th>Current</th>
            <th>Buying Price</th>
            <th>Target Qty</th>
            <th>Actual Qty</th>
            <th>Current Price</th>
            <th>Buying Value</th>
            <th>Current Value</th>
            <th>Profit/Loss</th>
            <th>Fine-Tune</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((holding, index) => (
            <tr
              key={index}
              className={holding.needsFineTuning ? 'needs-fine-tune' : ''}
            >
              <td className="bucket-cell">
                {holding.bucketName}
                <small>{formatPercent(holding.bucketCurrentAllocation)} / {formatPercent(holding.bucketTargetAllocation)}</small>
              </td>
              <td className="code-cell">{holding.code}</td>
              <td className="name-cell">{holding.name}</td>
              <td className="percent-cell">
                {formatPercent(holding.targetAllocation)}
                {holding.fineTuneThreshold && (
                  <small>±{holding.fineTuneThreshold}%</small>
                )}
              </td>
              <td className="percent-cell">
                {formatPercent(holding.currentAllocation)}
                {holding.needsFineTuning && (
                  <small className="warning"> ({formatPercent(holding.currentAllocation - holding.targetAllocation)})</small>
                )}
              </td>
              <td className="price-cell">{formatCurrency(holding.buyingPrice)}</td>
              <td className="qty-cell">{holding.targetQuantity.toLocaleString()}</td>
              <td className="qty-cell">{holding.actualQuantity.toLocaleString()}</td>
              <td className="price-cell">{formatCurrency(holding.currentPrice)}</td>
              <td className="value-cell">{formatCurrency(holding.buyingValue)}</td>
              <td className="value-cell">{formatCurrency(holding.currentValue)}</td>
              <td className={`profit-cell ${holding.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(holding.profitLoss)}
              </td>
              <td className={`status-cell ${holding.needsFineTuning ? 'warning' : 'ok'}`}>
                {holding.needsFineTuning ? 'YES' : 'NO'}
              </td>
              <td className={`action-cell ${holding.tradeAction}`}>
                {holding.tradeAction !== 'HOLD' ? (
                  <span>
                    {holding.tradeAction} {holding.quantityToTrade.toLocaleString()}
                    <br />
                    <small>{formatCurrency(holding.tradeValue)}</small>
                    {holding.tradeReason && (
                      <small className="trade-reason">({holding.tradeReason})</small>
                    )}
                  </span>
                ) : (
                  <span className="hold">-</span>
                )}
              </td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="9" className="total-label">Total Portfolio</td>
            <td className="total-value">
              {formatCurrency(data.reduce((sum, h) => sum + h.buyingValue, 0))}
            </td>
            <td className="total-value">
              {formatCurrency(data.reduce((sum, h) => sum + h.currentValue, 0))}
            </td>
            <td className={`total-profit ${data.reduce((sum, h) => sum + h.profitLoss, 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(data.reduce((sum, h) => sum + h.profitLoss, 0))}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
