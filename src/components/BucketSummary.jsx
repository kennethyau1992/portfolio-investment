import React from 'react';

const BucketSummary = ({ buckets }) => {
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
    <div className="bucket-summary">
      <h2>Bucket-Level Analysis (5/25 Band Rule)</h2>
      <div className="bucket-cards">
        {Object.values(buckets).map((bucket, index) => (
          <div
            key={index}
            className={`bucket-card ${bucket.needsRebalancing ? 'needs-rebalance' : ''}`}
          >
            <h3 className="bucket-name">{bucket.name}</h3>
            <p className="bucket-description">{bucket.description}</p>
            <div className="bucket-metrics">
              <div className="metric">
                <span className="label">Target</span>
                <span className="value">{formatPercent(bucket.targetAllocation)}</span>
              </div>
              <div className="metric">
                <span className="label">Current</span>
                <span className={`value ${bucket.currentAllocation > bucket.targetAllocation ? 'high' : bucket.currentAllocation < bucket.targetAllocation ? 'low' : ''}`}>
                  {formatPercent(bucket.currentAllocation)}
                </span>
              </div>
              <div className="metric">
                <span className="label">Target Value</span>
                <span className="value">{formatCurrency(bucket.targetValue)}</span>
              </div>
              <div className="metric">
                <span className="label">Current Value</span>
                <span className="value">{formatCurrency(bucket.currentValue)}</span>
              </div>
              <div className="metric">
                <span className="label">Band</span>
                <span className="value">
                  {formatPercent(bucket.lowerBand)} - {formatPercent(bucket.upperBand)}
                </span>
              </div>
              <div className="metric">
                <span className="label">Difference</span>
                <span className={`value ${bucket.absoluteDifference > 0 ? 'positive' : bucket.absoluteDifference < 0 ? 'negative' : ''}`}>
                  {bucket.absoluteDifference > 0 ? '+' : ''}{formatPercent(bucket.absoluteDifference)}
                </span>
              </div>
              <div className="metric">
                <span className="label">Relative Diff</span>
                <span className="value">{formatPercent(bucket.relativeDifference)}</span>
              </div>
            </div>
            <div className={`bucket-status ${bucket.needsRebalancing ? 'warning' : 'ok'}`}>
              {bucket.needsRebalancing ? 'NEEDS REBALANCING' : 'IN BAND'}
            </div>
            {bucket.needsRebalancing && (
              <div className={`bucket-action ${bucket.action}`}>
                {bucket.action} {formatCurrency(bucket.tradeValue)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BucketSummary;