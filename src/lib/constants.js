export const CPP = {
  MAX_MONTHLY_2026: 1507.65,
  AVG_MONTHLY_2025: 803.76,
  EARLY_REDUCTION_PER_MONTH: 0.006,
  LATE_ENHANCEMENT_PER_MONTH: 0.007,
  EARLY_START_AGE: 60,
  STANDARD_AGE: 65,
  LATE_START_AGE: 70,
}

export const OAS = {
  MONTHLY_65_74: 742.31,
  MONTHLY_75_PLUS: 816.54,
  CLAWBACK_THRESHOLD: 148451,
  ELIGIBILITY_AGE: 65,
}

export const RRSP = {
  ANNUAL_LIMIT_2025: 32490,
  ANNUAL_LIMIT_2026: 33810,
}

export const TFSA = {
  ANNUAL_LIMIT_2025: 7000,
  ANNUAL_LIMIT_2026: 7000,
}

export const TORONTO_LIVING = {
  SINGLE_MONTHLY_ALL_IN: 3843,
  SINGLE_ANNUAL_ALL_IN: 46116,
}

// Federal marginal rates 2026 (source: canada.ca).
// 14% first bracket — Budget 2025 permanent cut from 15% to 14% took full effect Jan 1 2026.
export const FEDERAL_TAX_BRACKETS_2026 = [
  { upTo:  58523,    rate: 0.14   },
  { upTo: 117045,    rate: 0.205  },
  { upTo: 181440,    rate: 0.260  },
  { upTo: 258482,    rate: 0.29   },
  { upTo: Infinity,  rate: 0.33   },
]

// Federal Basic Personal Amount 2026 (full amount for income ≤ $181,440;
// gradually reduced to $14,829 for income ≥ $258,482).
export const FEDERAL_BPA_2026 = 16452

// Non-refundable credit rate = lowest federal bracket rate.
export const FEDERAL_CREDIT_RATE_2026 = 0.14

// Ontario marginal rates 2026 (source: ontario.ca / taxtips.ca).
export const ONTARIO_TAX_BRACKETS_2026 = [
  { upTo:  52886,    rate: 0.0505 },
  { upTo: 105773,    rate: 0.0915 },
  { upTo: 150000,    rate: 0.1116 },
  { upTo: 220000,    rate: 0.1216 },
  { upTo: Infinity,  rate: 0.1316 },
]

// Ontario Basic Personal Amount 2026.
export const ONTARIO_BPA_2026 = 12989

// Ontario non-refundable credit rate = lowest Ontario bracket rate.
export const ONTARIO_CREDIT_RATE_2026 = 0.0505

// Ontario surtax 2026 (applied on basic Ontario tax before credits).
// Threshold 1: 20% surtax on basic Ontario tax above $5,818.
// Threshold 2: additional 36% (total 56%) on basic Ontario tax above $7,446.
export const ONTARIO_SURTAX_2026 = {
  THRESHOLD_1: 5818,
  THRESHOLD_2: 7446,
  RATE_1: 0.20,
  RATE_2: 0.36,
}

// CPP 2026 employee contribution (source: canada.ca / CBA).
export const CPP_2026 = {
  RATE:          0.0595,    // 5.95% employee contribution rate
  YMPE:          74600,     // yearly maximum pensionable earnings
  BASIC_EXEMPT:  3500,      // basic exemption amount
  MAX_CONTRIB:   4230.45,   // maximum employee contribution (base tier)
  CPP2_RATE:     0.04,      // second tier rate
  CPP2_YAMPE:    85000,     // yearly additional max pensionable earnings
  CPP2_MAX:      416.00,    // maximum CPP2 employee contribution
}

// EI 2026 employee premiums (source: canada.ca).
export const EI_2026 = {
  RATE:          0.0163,    // $1.63 per $100 of insurable earnings
  MAX_INSURABLE: 68900,     // maximum insurable earnings
  MAX_PREMIUM:   1123.07,   // maximum employee annual premium
}

export const DATA_FRESHNESS_NOTE =
  'Ontario Retirement Calculator — Tax brackets, CPP/OAS rates, RRSP/TFSA limits based on 2026 CRA announcements. For illustrative purposes only and does not constitute financial advice.'

export const APP_DEFAULTS = {
  currentAge: 35,
  retirementAge: 65,
  currentSavings: 50000,
  otherNetAssets: 0,
  annualIncome: 85000,
  annualExpenses: 60000,
  rrspContribution: 700,
  rrspFrequency: 'monthly',
  tfsaContribution: 200,
  tfsaFrequency: 'monthly',
  nonRegContribution: 100,
  nonRegFrequency: 'monthly',
  salaryGrowthRate: 0.02,
  desiredRetirementIncome: 60000,
  returnRate: 0.06,
  returnRateRetirement: 0.03,
  inflationRate: 0.025,
  stdDevPre: 0.12,
  stdDevPost: 0.08,
  swrRate: 0.04,
  lifeExpectancy: 90,
  cppMonthly: CPP.AVG_MONTHLY_2025,
  oasMonthly: OAS.MONTHLY_65_74,
  otherPensionMonthly: 0,
  cppStartAge: 65,
  oasStartAge: 65,
  mcMode: 'historical',
}
