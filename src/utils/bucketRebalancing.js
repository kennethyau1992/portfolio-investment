export const calculateBucketRebalancing = (holdings, currentPrices, accountEquity, bucketConfig, fineTuneThreshold) => {
  const holdingsWithPrices = holdings.map(holding => ({
    ...holding,
    currentPrice: currentPrices[holding.code] || holding.buyingPrice,
    currentValue: holding.actualQuantity * (currentPrices[holding.code] || holding.buyingPrice)
  }));

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.currentValue, 0);

  const bucketAnalysis = {};
  Object.keys(bucketConfig).forEach(bucketId => {
    const bucketHoldings = holdingsWithPrices.filter(h => h.bucket === bucketId);
    const bucketCurrentValue = bucketHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const bucketTargetValue = accountEquity * (bucketConfig[bucketId].targetAllocation / 100);
    const bucketCurrentAllocation = (bucketCurrentValue / accountEquity) * 100;
    const bucketTargetAllocation = bucketConfig[bucketId].targetAllocation;

    const absoluteDiff = bucketCurrentAllocation - bucketTargetAllocation;
    const relativeDiff = Math.abs(absoluteDiff / bucketTargetAllocation) * 100;
    const needsBucketRebalance = Math.abs(absoluteDiff) >= 5 || relativeDiff >= 25;

    const bucketValueDiff = bucketTargetValue - bucketCurrentValue;
    const bucketAction = bucketValueDiff > 0 ? 'BUY' : bucketValueDiff < 0 ? 'SELL' : 'HOLD';
    const bucketQuantityDiff = Math.round(bucketValueDiff / (bucketCurrentValue / bucketHoldings.length));

    bucketAnalysis[bucketId] = {
      ...bucketConfig[bucketId],
      holdings: bucketHoldings,
      currentValue: bucketCurrentValue,
      targetValue: bucketTargetValue,
      currentAllocation: bucketCurrentAllocation,
      targetAllocation: bucketTargetAllocation,
      absoluteDifference: absoluteDiff,
      relativeDifference: relativeDiff,
      needsRebalancing: needsBucketRebalance,
      action: bucketAction,
      quantityToTrade: Math.abs(bucketQuantityDiff),
      tradeValue: Math.abs(bucketValueDiff),
      upperBand: bucketTargetAllocation + 5,
      lowerBand: Math.max(0, bucketTargetAllocation - 5)
    };
  });

  const processedHoldings = holdingsWithPrices.map(holding => {
    const bucketId = holding.bucket;
    const bucketInfo = bucketAnalysis[bucketId];
    const buyingValue = holding.actualQuantity * holding.buyingPrice;
    const targetValue = accountEquity * (holding.targetAllocation / 100);
    const currentAllocation = (holding.currentValue / accountEquity) * 100;

    const absoluteDiff = currentAllocation - holding.targetAllocation;
    const relativeDiff = Math.abs(absoluteDiff / holding.targetAllocation) * 100;

    let tradeAction = 'HOLD';
    let quantityToTrade = 0;
    let tradeValue = 0;
    let tradeReason = '';
    let needsFineTuning = false;

    if (bucketInfo.needsRebalancing) {
      tradeReason = 'Bucket Rebalance';

      const bucketOverweight = bucketInfo.currentAllocation > bucketInfo.targetAllocation;
      const otherBucketId = bucketId === 'equity' ? 'alt' : 'equity';
      const otherBucketInfo = bucketAnalysis[otherBucketId];

      if (bucketOverweight) {
        if (absoluteDiff > 0) {
          tradeAction = 'SELL';
          quantityToTrade = Math.round((holding.currentValue - targetValue) / holding.currentPrice);
          tradeValue = holding.currentValue - targetValue;
        } else if (absoluteDiff < 0 && otherBucketInfo && !otherBucketInfo.needsRebalancing) {
          if (otherBucketInfo.currentAllocation < otherBucketInfo.targetAllocation) {
            tradeAction = 'BUY';
            quantityToTrade = Math.round((targetValue - holding.currentValue) / holding.currentPrice);
            tradeValue = targetValue - holding.currentValue;
          }
        }
      } else {
        if (absoluteDiff < 0) {
          tradeAction = 'BUY';
          quantityToTrade = Math.round((targetValue - holding.currentValue) / holding.currentPrice);
          tradeValue = targetValue - holding.currentValue;
        } else if (absoluteDiff > 0 && otherBucketInfo && !otherBucketInfo.needsRebalancing) {
          if (otherBucketInfo.currentAllocation > otherBucketInfo.targetAllocation) {
            tradeAction = 'SELL';
            quantityToTrade = Math.round((holding.currentValue - targetValue) / holding.currentPrice);
            tradeValue = holding.currentValue - targetValue;
          }
        }
      }
    } else if (bucketId === 'alt') {
      needsFineTuning = Math.abs(absoluteDiff) >= fineTuneThreshold;

      if (needsFineTuning) {
        tradeReason = 'Fine-Tune';
        const quantityDiff = Math.round((targetValue - holding.currentValue) / holding.currentPrice);

        if (quantityDiff > 0) {
          tradeAction = 'BUY';
          quantityToTrade = Math.abs(quantityDiff);
          tradeValue = Math.abs(quantityDiff * holding.currentPrice);
        } else if (quantityDiff < 0) {
          tradeAction = 'SELL';
          quantityToTrade = Math.abs(quantityDiff);
          tradeValue = Math.abs(quantityDiff * holding.currentPrice);
        }
      }
    }

    return {
      ...holding,
      buyingValue,
      targetValue,
      currentAllocation,
      profitLoss: holding.currentValue - buyingValue,
      profitLossPercent: ((holding.currentValue - buyingValue) / buyingValue) * 100,
      bucket: bucketId,
      bucketName: bucketInfo.name,
      bucketCurrentAllocation: bucketInfo.currentAllocation,
      bucketTargetAllocation: bucketInfo.targetAllocation,
      bucketNeedsRebalance: bucketInfo.needsRebalancing,
      bucketAction: bucketInfo.action,
      needsFineTuning,
      recommendedQuantity: Math.round(targetValue / holding.currentPrice),
      quantityToTrade,
      tradeAction,
      tradeValue,
      tradeReason,
      upperBand: bucketInfo.upperBand,
      lowerBand: bucketInfo.lowerBand,
      fineTuneThreshold,
      fineTuneUpper: holding.targetAllocation + fineTuneThreshold,
      fineTuneLower: Math.max(0, holding.targetAllocation - fineTuneThreshold)
    };
  });

  return {
    holdings: processedHoldings,
    buckets: bucketAnalysis,
    totalValue,
    accountEquity
  };
};

export const getBucketBands = (targetAllocation) => {
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

