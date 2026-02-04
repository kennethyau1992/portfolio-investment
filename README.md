# Portfolio Dashboard

A React-based portfolio monitoring dashboard with 5/25 band rebalancing recommendations.

## Features

- Real-time portfolio monitoring with live stock prices (Alpha Vantage API)
- Automatic margin debt tracking and equity calculation
- Two-tier rebalancing strategy (bucket-level + fine-tuning)
- Buy/Sell recommendations based on allocation drift
- Visual allocation charts (current vs target)
- Profit/Loss tracking
- Leverage ratio monitoring
- Bucket-level analysis for Equity and Alternatives
- Responsive design

## Rebalancing Strategy

The dashboard uses a sophisticated two-tier rebalancing approach:

### Tier 1: Bucket-Level Rebalancing (5/25 Band)

- **Equity Bucket** (AVGV, HFEQ, ENDW):
  - Target: 70% of equity
  - Rebalance if outside 65-75% range
  - Sell overweight, buy underweight within equity bucket

- **Alternatives Bucket** (HFGM, AVRE, HFMF, CTA, KMLM):
  - Target: 60% of equity
  - Rebalance if outside 55-65% range
  - Sell overweight, buy underweight within alternatives bucket

### Tier 2: Fine-Tuning

- Applies to holdings with individual fine-tune thresholds (AVGV, Alt bucket funds)
- **AVGV**: Fine-tune if allocation drifts by ±5% absolute (target 50%, so 45-55% range)
- **Alternative Funds**: Fine-tune if allocation drifts by ±3% absolute (target 10%, so 7-13% range)
- Only applies if bucket is within its 5/25 band
- **Relative 25%**: If allocation drifts by ±25% of its target, rebalance
- The more restrictive band is applied

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Updating Portfolio Data

Edit `src/data/portfolio.json` to update your holdings. The data structure includes:

**Account Settings:**
- `marginDebt`: Your total margin debt (for margin accounts)

**Holdings:**
- `code`: Stock/ETF symbol
- `name`: Full name of the holding
- `targetAllocation`: Target allocation percentage
- `buyingPrice`: Average purchase price
- `targetQuantity`: Target quantity based on current value
- `actualQuantity`: Current quantity held
- `fineTuneThreshold` (optional): Individual fine-tune threshold in % (e.g., 5 for AVGV)

**Margin Accounts:**
If you're using margin, allocations are calculated based on your account equity:
- Total Value = Sum of all holdings' current market value
- Account Equity = Total Value - Margin Debt
- Current Allocation = (Holding Value / Account Equity) × 100%

The dashboard automatically calculates:
- Account Equity = Total Value - Margin Debt
- Leverage Ratio = Total Value / Account Equity

### Setting Up Alpha Vantage API

The dashboard uses Alpha Vantage for real-time stock prices. To enable live prices:

1. Get a free API key from https://www.alphavantage.co/support/#api-key
2. **For local development:**
   - Create a `.env` file in the project root
   - Add: `VITE_ALPHA_VANTAGE_API_KEY=your_actual_api_key_here`
3. **For GitHub Pages deployment:**
   - Go to your GitHub repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `ALPHA_VANTAGE_API_KEY`
   - Value: Your actual API key
   - Push to trigger deployment

**Note:** Alpha Vantage free tier has 25 API calls per day. The dashboard will fall back to mock prices if the limit is reached or if no API key is provided.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

### Initial Setup

1. Push this repository to GitHub
2. Go to your repository Settings > Pages
3. Under "Source", select "GitHub Actions"
4. Push changes to trigger the deployment

The workflow in `.github/workflows/deploy.yml` will automatically deploy your app to GitHub Pages.

### Manual Deployment

Alternatively, you can deploy manually:

```bash
npm run deploy
```

## Project Structure

```
portfolio-dashboard/
├── src/
│   ├── api/
│   │   └── stockPrices.js      # API integration for fetching prices
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard component
│   │   ├── PortfolioTable.jsx  # Holdings table with recommendations
│   │   └── AllocationChart.jsx # Pie chart for allocation visualization
│   ├── data/
│   │   └── portfolio.json      # Your portfolio data
│   ├── utils/
│   │   └── rebalancing.js      # 5/25 band rebalancing logic
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── public/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions deployment workflow
├── package.json
└── vite.config.js
```

## Customization

### Stock Price Updates

The dashboard uses Alpha Vantage API for live stock prices. To modify or change the price source:

1. Edit `src/api/stockPrices.js`
2. The `fetchStockPrices` function uses Alpha Vantage's GLOBAL_QUOTE endpoint
3. You can modify it to use other APIs (Yahoo Finance, IEX Cloud, etc.)

**Price Update Frequency:**
- Prices are fetched when the dashboard loads
- Refresh the page to get the latest prices
- For GitHub Pages, prices update each time you push new code

### Styling

All styles are in `src/App.css`. Modify to customize colors, fonts, and layout.

## License

MIT
