# Ontario Retirement Calculator

A retirement planning calculator built for Ontario residents. Enter your income, savings, and contribution details to get a projection of your retirement readiness, Monte Carlo success rate, and personalised recommendations.

Built with **Svelte 5** + **Vite** + **Chart.js**. Runs entirely in the browser — no data is sent to any server.

---

## Features

### Inputs

**Core**
- Current age and desired retirement age
- Current retirement savings
- Annual pre-tax income — with a live estimated take-home display (see below)
- Annual living expenses
- Per-account retirement contributions (RRSP, TFSA, Non-Registered) each with independent frequency selector (weekly / bi-weekly / monthly / quarterly / annually)
- Annual salary growth rate

**Pension & Government Benefits**
- CPP monthly amount (base at age 65) with adjustable start age (60–70)
  - Early: −0.6%/month before 65 (max −36% at 60)
  - Late: +0.7%/month after 65 (max +42% at 70)
- OAS monthly amount with adjustable start age (65–70)
  - Deferral bonus: +0.6%/month after 65 (max +36% at 70)
- Other pension income

**Assumptions**
- Pre-retirement and post-retirement investment return rates
- Expected inflation rate
- Safe Withdrawal Rate (SWR) for FIRE number
- Monte Carlo simulation method: Lognormal or Historical S&P 500 bootstrapping
- Return volatility (pre and post retirement)
- Life expectancy

### Estimated Take-Home Income

Shown live below the annual pre-tax income field. Calculated using 2026 CRA rules:

- Federal and Ontario progressive tax brackets
- Federal and Ontario Basic Personal Amount non-refundable credits
- Ontario surtax
- CPP (base tier + CPP2 second tier) employee contributions
- EI employee premiums
- RRSP annual contribution as a taxable income deduction

The result reflects actual spendable income after all deductions including the RRSP contribution.

### RRSP Contribution Limit Hint

Dynamically calculates your personal RRSP room as the lesser of:
- 18% of your annual earned income
- CRA 2026 annual maximum ($33,810)

### Results Panel

- **Nest egg** projected at retirement vs **required capital**
- **Surplus / shortfall** with green / amber / red status
- **FIRE number** (today's dollars, based on your SWR and pension income)
- **FIRE progress bar** showing current savings vs FIRE target
- **Retirement income breakdown**: CPP + OAS + other pension + portfolio drawdown
- **Recommendations** when a shortfall exists:
  - Increase annual contributions (with exact dollar target)
  - Delay retirement (minimum years needed)
  - Reduce desired retirement income (affordable amount)

### Charts

- **Portfolio Projection** — year-by-year balance from today to life expectancy
- **Monte Carlo Simulation** — 500 scenarios showing P10 / P50 / P90 bands with success rate
- **Surplus/Shortfall** — how far ahead or behind you are at each age
- **Retirement Income Sources** — stacked breakdown of CPP, OAS, pension, and drawdown

---

## Monte Carlo Simulation

Two modes available:

| Mode | Description |
|------|-------------|
| **Lognormal** | Draws returns from a lognormal distribution using your return rate and volatility settings. Prevents impossible returns (<−100%) and models the positive skew of real markets. |
| **Historical S&P 500** | Randomly resamples actual S&P 500 annual returns (1926–2024, 99 years). Captures real crashes and fat tails without distributional assumptions. |

500 simulations are run. Success rate = percentage of scenarios where the portfolio survives to life expectancy.

---

## Tax & Rates Data (2026)

All figures are based on 2026 CRA announcements.

| Item | 2026 Value |
|------|-----------|
| Federal bracket 1 | 14% on ≤ $58,523 |
| Federal BPA | $16,452 |
| Ontario BPA | $12,989 |
| Ontario surtax threshold 1 | $5,818 (20% surtax) |
| Ontario surtax threshold 2 | $7,446 (+36% surtax) |
| CPP YMPE | $74,600 |
| CPP max contribution (base) | $4,230.45 |
| CPP2 YAMPE | $85,000 |
| EI rate | $1.63 / $100 |
| EI max insurable earnings | $68,900 |
| RRSP annual limit | $33,810 |
| TFSA annual limit | $7,000 |
| CPP max monthly (2026) | $1,507.65 |
| OAS monthly (age 65–74) | $742.31 |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

---

## Project Structure

```
src/
├── App.svelte                    # Root layout, shared state
├── lib/
│   ├── calculations.js           # All financial logic (projections, Monte Carlo, tax)
│   ├── constants.js              # 2026 tax brackets, CPP/EI/RRSP/TFSA constants
│   └── historicalReturns.js      # S&P 500 annual returns 1926–2024
├── components/
│   ├── SectionCore.svelte        # Age, income, contributions, take-home estimate
│   ├── SectionPension.svelte     # CPP, OAS, other pension with start age sliders
│   ├── SectionAssumptions.svelte # Returns, inflation, SWR, Monte Carlo settings
│   ├── ResultsPanel.svelte       # Summary cards, recommendations
│   ├── ProjectionChart.svelte    # Portfolio balance chart
│   ├── MonteCarloChart.svelte    # Monte Carlo band chart
│   ├── SurplusChart.svelte       # Surplus/shortfall chart
│   └── IncomeSourcesChart.svelte # Retirement income breakdown chart
└── styles/
    ├── global.css                # CSS variables, reset, typography
    └── components.css            # Shared field, card, and chart styles
```

---

## Disclaimer

This calculator is for illustrative and educational purposes only. It does not constitute financial, tax, or investment advice. Consult a qualified financial advisor before making retirement planning decisions. Tax calculations are estimates and do not account for all deductions, credits, or individual circumstances.
