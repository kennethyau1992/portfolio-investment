const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';

export const fetchStockPrices = async (symbols) => {
  const prices = {};
  
  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const data = await response.json();
      
      if (data['Global Quote']) {
        prices[symbol] = parseFloat(data['Global Quote']['05. price']);
      } else {
        console.warn(`Could not fetch price for ${symbol}`);
        prices[symbol] = null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      prices[symbol] = null;
    }
  }
  
  return prices;
};

export const fetchMockPrices = (symbols) => {
  const mockPrices = {
    'AVGV': 79.87,
    'HFEQ': 22.50,
    'ENDW': 32.55,
    'HFGM': 32.64,
    'AVRE': 45.16,
    'HFMF': 22.70,
    'CTA': 28.34,
    'KMLM': 26.61
  };
  
  const prices = {};
  symbols.forEach(symbol => {
    prices[symbol] = mockPrices[symbol] || 0;
  });
  
  return prices;
};
