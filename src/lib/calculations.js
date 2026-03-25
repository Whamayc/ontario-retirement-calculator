import { SP500_ANNUAL_RETURNS } from './historicalReturns.js'

// ─── Contribution frequency helpers ──────────────────────────────────────────

const PERIODS_PER_YEAR = { weekly: 52, biweekly: 26, monthly: 12, quarterly: 4, annually: 1 }

// Within-year compounding factor for periodic contributions.
// More frequent contributions are invested earlier → earn more return within the year.
// For n periods/year at annual rate r:
//   periodic rate r_p = (1+r)^(1/n) − 1
//   factor = r / (n × r_p)   [≥ 1 for r > 0, equals 1 when n = 1 or r = 0]
function contributionFactor(annualRate, n) {
  if (n <= 1 || annualRate === 0) return 1
  const periodicRate = Math.pow(1 + annualRate, 1 / n) - 1
  return annualRate / (n * periodicRate)
}

function getContribFactor(inputs, rate) {
  const n = PERIODS_PER_YEAR[inputs.contributionFrequency ?? 'annually'] ?? 1
  return contributionFactor(rate, n)
}

// ─── CPP / OAS adjustment helpers ────────────────────────────────────────────

// CPP: Early (60–64) −0.6%/month before 65 → max −36% at 60
//      Late  (66–70) +0.7%/month after  65 → max +42% at 70
export function adjustCPP(cppMonthly, cppStartAge) {
  const monthsDiff = (cppStartAge - 65) * 12
  const factor = monthsDiff < 0
    ? 1 + monthsDiff * 0.006
    : 1 + monthsDiff * 0.007
  return cppMonthly * Math.max(0, factor)
}

// OAS: Deferral (66–70) +0.6%/month after 65 → max +36% at 70
export function adjustOAS(oasMonthly, oasStartAge) {
  if (oasStartAge <= 65) return oasMonthly
  const monthsDiff = Math.min((oasStartAge - 65) * 12, 60)
  return oasMonthly * (1 + monthsDiff * 0.006)
}

// ─── Phased required capital ──────────────────────────────────────────────────
// When CPP/OAS start after retirement there is a gap period with higher drawdown.
// Splits retirement into phases and sums discounted PV of each flat-nominal phase.
function phasedPV(r, retirementAge, lifeExpectancy, futureIncome, futureCPP, futureOAS, futurePensionOther, cppAge, oasAge) {
  const boundaries = [...new Set([retirementAge, cppAge, oasAge, lifeExpectancy])]
    .filter(a => a >= retirementAge && a <= lifeExpectancy)
    .sort((a, b) => a - b)

  let totalPV = 0
  for (let i = 0; i < boundaries.length - 1; i++) {
    const phaseStart = boundaries[i]
    const phaseEnd   = boundaries[i + 1]
    const duration   = phaseEnd - phaseStart
    const offset     = phaseStart - retirementAge
    const activeCPP  = phaseStart >= cppAge ? futureCPP : 0
    const activeOAS  = phaseStart >= oasAge ? futureOAS : 0
    const drawdown   = Math.max(0, futureIncome - futurePensionOther - activeCPP - activeOAS)
    totalPV += PV_annuity(r, duration, drawdown) * Math.pow(1 + r, -offset)
  }
  return totalPV
}

// ─── Core financial primitives ────────────────────────────────────────────────

export function FV_lump(rate, nper, pv) {
  return pv * Math.pow(1 + rate, nper)
}

export function FV_annuity(rate, nper, pmt) {
  if (rate === 0) return pmt * nper
  return pmt * (Math.pow(1 + rate, nper) - 1) / rate
}

// FV of a growing annuity: PMT grows at rate g each year
export function FV_growing_annuity(rate, nper, pmt, g) {
  if (nper <= 0) return 0
  if (g === 0) return FV_annuity(rate, nper, pmt)
  if (rate === g) return pmt * nper * Math.pow(1 + rate, nper - 1)
  return pmt * (Math.pow(1 + rate, nper) - Math.pow(1 + g, nper)) / (rate - g)
}

export function PV_annuity(rate, nper, pmt) {
  if (nper <= 0 || pmt <= 0) return 0
  if (rate === 0) return pmt * nper
  return pmt * (1 - Math.pow(1 + rate, -nper)) / rate
}

// Fisher equation: real rate after inflation
export function real_rate(nominal, inflation) {
  return (1 + nominal) / (1 + inflation) - 1
}

// ─── Monte Carlo simulation ───────────────────────────────────────────────────

function sampleNormal(mean, std) {
  let u, v
  do { u = Math.random() } while (u === 0)
  do { v = Math.random() } while (v === 0)
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Lognormal sample — preserves arithmetic mean & std, prevents returns < -100%.
// Converts arithmetic (mu, sigma) → log-space parameters, draws, then exponentiates.
function sampleLognormal(mu, sigma) {
  const sigmaLog = Math.sqrt(Math.log(1 + Math.pow(sigma / (1 + mu), 2)))
  const muLog    = Math.log(1 + mu) - 0.5 * sigmaLog * sigmaLog
  return Math.exp(sampleNormal(muLog, sigmaLog)) - 1
}

function percentile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export function runMonteCarlo(inputs, n = 500) {
  const {
    currentAge, retirementAge, lifeExpectancy,
    currentSavings, annualContribution, salaryGrowthRate,
    returnRate, returnRateRetirement, inflationRate,
    stdDevPre, stdDevPost,
    desiredRetirementIncome, cppMonthly, oasMonthly, otherPensionMonthly,
  } = inputs

  if (retirementAge <= currentAge || retirementAge >= lifeExpectancy) return null

  const mcMode = inputs.mcMode ?? 'lognormal'

  const cppStartAge = inputs.cppStartAge ?? 65
  const oasStartAge = inputs.oasStartAge ?? 65
  const adjCPP = adjustCPP(cppMonthly, cppStartAge)
  const adjOAS = adjustOAS(oasMonthly, oasStartAge)
  const cppAge = Math.max(cppStartAge, retirementAge)
  const oasAge = Math.max(oasStartAge, retirementAge)

  const yearsToRetire      = retirementAge - currentAge
  const inflationFactor    = Math.pow(1 + inflationRate, yearsToRetire)
  const futureIncome       = desiredRetirementIncome * inflationFactor
  const futureCPP          = adjCPP * 12 * inflationFactor
  const futureOAS          = adjOAS * 12 * inflationFactor
  const futurePensionOther = otherPensionMonthly * 12 * inflationFactor

  const cFactor = getContribFactor(inputs, returnRate)

  // Sampling functions per mode
  const samplePre  = mcMode === 'historical'
    ? () => SP500_ANNUAL_RETURNS[Math.floor(Math.random() * SP500_ANNUAL_RETURNS.length)]
    : () => sampleLognormal(returnRate, stdDevPre)

  const samplePost = mcMode === 'historical'
    ? () => SP500_ANNUAL_RETURNS[Math.floor(Math.random() * SP500_ANNUAL_RETURNS.length)]
    : () => sampleLognormal(returnRateRetirement, stdDevPost)

  const totalPoints = lifeExpectancy - currentAge + 1
  const allValues   = Array.from({ length: totalPoints }, () => [])
  let   successCount = 0

  for (let sim = 0; sim < n; sim++) {
    let portfolio    = currentSavings
    let contribution = annualContribution

    for (let i = 0; i < totalPoints; i++) {
      const age = currentAge + i
      allValues[i].push(Math.max(0, portfolio))

      if (age < retirementAge) {
        portfolio = portfolio * (1 + samplePre()) + contribution * cFactor
        contribution *= (1 + salaryGrowthRate)
      } else {
        const activeCPP      = age >= cppAge ? futureCPP : 0
        const activeOAS      = age >= oasAge ? futureOAS : 0
        const annualDrawdown = Math.max(0, futureIncome - futurePensionOther - activeCPP - activeOAS)
        portfolio = portfolio * (1 + samplePost()) - annualDrawdown
      }
    }

    if (portfolio >= 0) successCount++
  }

  const bands = allValues.map((vals, i) => {
    const sorted = [...vals].sort((a, b) => a - b)
    return {
      age: currentAge + i,
      p10: percentile(sorted, 10),
      p50: percentile(sorted, 50),
      p90: percentile(sorted, 90),
    }
  })

  return { successRate: successCount / n, n, bands }
}

// ─── Year-by-year projection series ──────────────────────────────────────────

function buildProjectionSeries(inputs, adjCPP, adjOAS) {
  const {
    currentAge, retirementAge, lifeExpectancy,
    currentSavings, annualContribution, salaryGrowthRate,
    returnRate, returnRateRetirement, inflationRate,
    desiredRetirementIncome, otherPensionMonthly,
  } = inputs

  const cppAge = Math.max(inputs.cppStartAge ?? 65, retirementAge)
  const oasAge = Math.max(inputs.oasStartAge ?? 65, retirementAge)

  const yearsToRetire      = retirementAge - currentAge
  const inflationFactor    = Math.pow(1 + inflationRate, yearsToRetire)
  const futureIncome       = desiredRetirementIncome * inflationFactor
  const futureCPP          = adjCPP * 12 * inflationFactor
  const futureOAS          = adjOAS * 12 * inflationFactor
  const futurePensionOther = otherPensionMonthly * 12 * inflationFactor

  const cFactor = getContribFactor(inputs, returnRate)

  const series = []
  let portfolio = currentSavings
  let totalContributed = currentSavings
  let contribution = annualContribution

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    const pv = Math.max(0, portfolio)
    const contributed = Math.max(0, Math.min(totalContributed, pv))
    series.push({
      age,
      portfolioValue: pv,
      contributions: contributed,
      interestEarned: pv - contributed,
    })

    if (age < retirementAge) {
      const effectiveContrib = contribution * cFactor
      portfolio = portfolio * (1 + returnRate) + effectiveContrib
      totalContributed += contribution          // track nominal contributed (not inflated by factor)
      contribution *= (1 + salaryGrowthRate)
    } else {
      const activeCPP = age >= cppAge ? futureCPP : 0
      const activeOAS = age >= oasAge ? futureOAS : 0
      const drawdown  = Math.max(0, futureIncome - futurePensionOther - activeCPP - activeOAS)
      portfolio = portfolio * (1 + returnRateRetirement) - drawdown
      totalContributed -= drawdown
    }
  }

  return series
}

// ─── Recommendations ─────────────────────────────────────────────────────────

function computeRecommendations(inputs, shortfall, requiredCapital) {
  const {
    returnRate, returnRateRetirement, retirementAge, currentAge,
    annualContribution, desiredRetirementIncome,
    inflationRate, lifeExpectancy,
    cppMonthly, oasMonthly, otherPensionMonthly,
  } = inputs

  const years = retirementAge - currentAge
  const recs = []

  // (a) Increase contributions
  if (years > 0) {
    let extraContrib
    if (returnRate === 0) {
      extraContrib = shortfall / years
    } else {
      extraContrib = shortfall * returnRate / (Math.pow(1 + returnRate, years) - 1)
    }
    recs.push({
      type: 'contribution',
      extraContrib,
      message: `Increase annual contributions by $${Math.ceil(extraContrib).toLocaleString('en-CA')} (to $${Math.ceil(annualContribution + extraContrib).toLocaleString('en-CA')}/year)`,
    })
  }

  // (b) Delay retirement (iterate +1yr, cap at 10)
  for (let delay = 1; delay <= 10; delay++) {
    const newRetirementAge = retirementAge + delay
    if (newRetirementAge >= lifeExpectancy) break

    const testInputs = { ...inputs, retirementAge: newRetirementAge }
    const testResults = runCalculations(testInputs)
    if (testResults.surplusShortfall >= 0) {
      recs.push({
        type: 'delay',
        delayYears: delay,
        newAge: newRetirementAge,
        message: `Delay retirement by ${delay} year${delay > 1 ? 's' : ''} to age ${newRetirementAge}`,
      })
      break
    }
  }

  // (c) Reduce desired income — back-solve affordable drawdown using retirement rate
  const retirementYears = lifeExpectancy - retirementAge
  const inflationFactor = Math.pow(1 + inflationRate, years)
  const pensionAnnual = (cppMonthly + oasMonthly + otherPensionMonthly) * 12

  let affordableDrawdown
  if (returnRateRetirement === 0) {
    affordableDrawdown = retirementYears > 0
      ? (requiredCapital - shortfall) / retirementYears
      : 0
  } else {
    const nestEgg = requiredCapital - shortfall
    affordableDrawdown = nestEgg > 0
      ? nestEgg * returnRateRetirement / (1 - Math.pow(1 + returnRateRetirement, -retirementYears))
      : 0
  }

  const affordableTotalFutureIncome = affordableDrawdown + pensionAnnual * inflationFactor
  const affordableTodayIncome = affordableTotalFutureIncome / inflationFactor
  const incomeReduction = desiredRetirementIncome - affordableTodayIncome

  if (incomeReduction > 0 && affordableTodayIncome > 0) {
    recs.push({
      type: 'income',
      reduction: incomeReduction,
      newIncome: affordableTodayIncome,
      message: `Reduce desired retirement income by $${Math.ceil(incomeReduction).toLocaleString('en-CA')} to $${Math.floor(affordableTodayIncome).toLocaleString('en-CA')}/year`,
    })
  }

  return recs
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function runCalculations(inputs) {
  const {
    currentAge, retirementAge, currentSavings,
    annualContribution, salaryGrowthRate, desiredRetirementIncome,
    returnRate, returnRateRetirement, inflationRate, lifeExpectancy,
    cppMonthly, oasMonthly, otherPensionMonthly,
    swrRate,
  } = inputs

  // Guard: invalid age configuration
  if (
    retirementAge <= currentAge ||
    retirementAge >= lifeExpectancy ||
    currentAge <= 0
  ) {
    return emptyResults()
  }

  const cppStartAge = inputs.cppStartAge ?? 65
  const oasStartAge = inputs.oasStartAge ?? 65
  const adjCPP = adjustCPP(cppMonthly, cppStartAge)
  const adjOAS = adjustOAS(oasMonthly, oasStartAge)
  const cppAge = Math.max(cppStartAge, retirementAge)
  const oasAge = Math.max(oasStartAge, retirementAge)

  const yearsToRetire   = retirementAge - currentAge
  const retirementYears = lifeExpectancy - retirementAge

  // Nest egg — contributions adjusted for within-year compounding based on frequency
  const cFactor         = getContribFactor(inputs, returnRate)
  const fvSavings       = FV_lump(returnRate, yearsToRetire, currentSavings)
  const fvContributions = FV_growing_annuity(returnRate, yearsToRetire, annualContribution * cFactor, salaryGrowthRate)
  const nestEgg         = fvSavings + fvContributions

  // Future nominal amounts at retirement
  const inflationFactor      = Math.pow(1 + inflationRate, yearsToRetire)
  const futureDesiredIncome  = desiredRetirementIncome * inflationFactor
  const futureCPP            = adjCPP * 12 * inflationFactor
  const futureOAS            = adjOAS * 12 * inflationFactor
  const futurePensionOther   = otherPensionMonthly * 12 * inflationFactor
  const futurePensionSteady  = futureCPP + futureOAS + futurePensionOther
  // Initial drawdown at retirement (before any delayed CPP/OAS)
  const futurePensionAtRetirement =
    futurePensionOther +
    (cppAge <= retirementAge ? futureCPP : 0) +
    (oasAge <= retirementAge ? futureOAS : 0)
  const annualDrawdownNeeded = Math.max(0, futureDesiredIncome - futurePensionAtRetirement)

  // Required capital — phased to account for gap before CPP/OAS starts
  const requiredCapital = phasedPV(
    returnRateRetirement, retirementAge, lifeExpectancy,
    futureDesiredIncome, futureCPP, futureOAS, futurePensionOther,
    cppAge, oasAge
  )
  const surplusShortfall = nestEgg - requiredCapital

  // Status
  let status
  if (surplusShortfall >= 0) {
    status = 'green'
  } else if (surplusShortfall > -requiredCapital * 0.20) {
    status = 'amber'
  } else {
    status = 'red'
  }

  // Recommendations
  const recommendations = surplusShortfall < 0
    ? computeRecommendations(inputs, Math.abs(surplusShortfall), requiredCapital)
    : []

  // Projection series for charts
  const projectionSeries = buildProjectionSeries(inputs, adjCPP, adjOAS)

  // Income breakdown — steady state when all pensions active
  const annualDrawdownSteady = Math.max(0, futureDesiredIncome - futurePensionSteady)
  const incomeBreakdown = {
    cpp:      futureCPP,
    oas:      futureOAS,
    pension:  futurePensionOther,
    drawdown: annualDrawdownSteady,
  }

  // FIRE Number (today's dollars, uses adjusted steady-state CPP/OAS)
  const fireNumberToday = swrRate > 0
    ? Math.max(0, desiredRetirementIncome - (adjCPP + adjOAS + otherPensionMonthly) * 12) / swrRate
    : 0
  const fireNumber   = swrRate > 0 ? annualDrawdownSteady / swrRate : 0
  const fireProgress = fireNumberToday > 0 ? Math.min(currentSavings / fireNumberToday, 1) : 1

  return {
    nestEgg,
    requiredCapital,
    surplusShortfall,
    status,
    recommendations,
    projectionSeries,
    incomeBreakdown,
    // Extra context for display
    yearsToRetire,
    retirementYears,
    inflationFactor,
    futureDesiredIncome,
    futurePensionIncome: futurePensionSteady,
    annualDrawdownNeeded,
    adjCPP,
    adjOAS,
    cppStartAge,
    oasStartAge,
    // FIRE
    fireNumber,
    fireNumberToday,
    fireProgress,
    swrRate,
  }
}

function emptyResults() {
  return {
    nestEgg: 0,
    requiredCapital: 0,
    surplusShortfall: 0,
    status: 'green',
    recommendations: [],
    projectionSeries: [],
    incomeBreakdown: { cpp: 0, oas: 0, pension: 0, drawdown: 0 },
    yearsToRetire: 0,
    retirementYears: 0,
    inflationFactor: 1,
    futureDesiredIncome: 0,
    futurePensionIncome: 0,
    annualDrawdownNeeded: 0,
    fireNumber: 0,
    fireNumberToday: 0,
    fireProgress: 0,
    swrRate: 0.04,
  }
}
