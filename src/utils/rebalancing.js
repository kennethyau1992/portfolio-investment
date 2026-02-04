export const calculateRebalancing = (holdings, currentPrices, totalPortfolioValue, accountEquity) => {
  const marginDebt = totalPortfolioValue - accountEquity;

  return holdings.map(holding => {
    const currentPrice = currentPrices[holding.code] || holding.buyingPrice;
    const currentValue = holding.actualQuantity * currentPrice;
    const buyingValue = holding.actualQuantity * holding.buyingPrice;
    const targetValue = accountEquity * (holding.targetAllocation / 100);
    const currentAllocation = (currentValue / accountEquity) * 100;

    const absoluteDifference = currentAllocation - holding.targetAllocation;
    const relativeDifference = Math.abs(absoluteDifference / holding.targetAllocation) * 100;

    const needsRebalancing =
      Math.abs(absoluteDifference) >= 5 || relativeDifference >= 25;

    const quantityDifference = Math.round((targetValue - currentValue) / currentPrice);
    const action = quantityDifference > 0 ? 'BUY' : quantityDifference < 0 ? 'SELL' : 'HOLD';

    return {
      ...holding,
      currentPrice,
      currentValue,
      buyingValue,
      targetValue,
      currentAllocation,
      profitLoss: currentValue - buyingValue,
      profitLossPercent: ((currentValue - buyingValue) / buyingValue) * 100,
      needsRebalancing,
      recommendedQuantity: Math.round(targetValue / currentPrice),
      quantityToTrade: Math.abs(quantityDifference),
      tradeAction: action,
      tradeValue: Math.abs(quantityDifference * currentPrice)
    };
  });
};

export const getRebalancingBands = (targetAllocation) => {
  const absoluteBand = 5;
  const relativeBand = 25;
  
  const upperAbsolute = targetAllocation + absoluteBand;
  const lowerAbsolute = Math.max(0, targetAllocation - absoluteBand);
  const upperRelative = targetAllocation * (1 + relativeBand / 100);
  const lowerRelative = Math.max(0, targetAllocation * (1 - relativeBand / 100));
  
  return {
    upperBand: Math.min(upperAbsolute, upperRelative),
    lowerBand: Math.max(lowerAbsolute, lowerRelative)
  };
};
