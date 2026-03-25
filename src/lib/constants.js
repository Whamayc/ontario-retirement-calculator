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
}

export const TFSA = {
  ANNUAL_LIMIT_2025: 7000,
}

export const TORONTO_LIVING = {
  SINGLE_MONTHLY_ALL_IN: 3843,
  SINGLE_ANNUAL_ALL_IN: 46116,
}

export const FEDERAL_TAX_BRACKETS_2025 = [
  { upTo: 57375,    rate: 0.145  },
  { upTo: 114750,   rate: 0.205  },
  { upTo: 177882,   rate: 0.260  },
  { upTo: 253414,   rate: 0.2931 },
  { upTo: Infinity, rate: 0.33   },
]

export const ONTARIO_TAX_BRACKETS = [
  { upTo: 52886,    rate: 0.0505 },
  { upTo: 105775,   rate: 0.0915 },
  { upTo: 150000,   rate: 0.1116 },
  { upTo: 220000,   rate: 0.1216 },
  { upTo: Infinity, rate: 0.1316 },
]

export const DATA_FRESHNESS_NOTE =
  'Ontario Retirement Calculator — CPP/OAS rates based on Q1 2026 maximums. RRSP/TFSA limits based on 2025 CRA announcements. For illustrative purposes only and does not constitute financial advice.'

export const APP_DEFAULTS = {
  currentAge: 35,
  retirementAge: 65,
  currentSavings: 50000,
  annualIncome: 85000,
  annualExpenses: 60000,
  annualContribution: 12000,
  contributionFrequency: 'annually',
  salaryGrowthRate: 0.02,
  desiredRetirementIncome: 60000,
  returnRate: 0.06,
  returnRateRetirement: 0.04,
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
  mcMode: 'lognormal',
}
