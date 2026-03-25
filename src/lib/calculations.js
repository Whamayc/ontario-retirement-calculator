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

  const STD_PRE  = stdDevPre
  const STD_POST = stdDevPost

  const yearsToRetire    = retirementAge - currentAge
  const inflationFactor  = Math.pow(1 + inflationRate, yearsToRetire)
  const futurePension    = (cppMonthly + oasMonthly + otherPensionMonthly) * 12 * inflationFactor
  const annualDrawdown   = Math.max(0, desiredRetirementIncome * inflationFactor - futurePension)

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
        portfolio = portfolio * (1 + sampleNormal(returnRate, STD_PRE)) + contribution
        contribution *= (1 + salaryGrowthRate)
      } else {
        portfolio = portfolio * (1 + sampleNormal(returnRateRetirement, STD_POST)) - annualDrawdown
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

function buildProjectionSeries(inputs, nestEgg, annualDrawdownNeeded) {
  const {
    currentAge, retirementAge, lifeExpectancy,
    currentSavings, annualContribution, salaryGrowthRate,
    returnRate, returnRateRetirement,
  } = inputs

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
      portfolio = portfolio * (1 + returnRate) + contribution
      totalContributed += contribution
      contribution *= (1 + salaryGrowthRate)
    } else {
      portfolio = portfolio * (1 + returnRateRetirement) - annualDrawdownNeeded
      totalContributed -= annualDrawdownNeeded
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

  const yearsToRetire = retirementAge - currentAge
  const retirementYears = lifeExpectancy - retirementAge

  // Steps 1–4: nest egg
  const fvSavings = FV_lump(returnRate, yearsToRetire, currentSavings)
  const fvContributions = FV_growing_annuity(returnRate, yearsToRetire, annualContribution, salaryGrowthRate)
  const nestEgg = fvSavings + fvContributions

  // Steps 5–8: required drawdown
  const inflationFactor = Math.pow(1 + inflationRate, yearsToRetire)
  const futureDesiredIncome = desiredRetirementIncome * inflationFactor
  const futurePensionIncome = (cppMonthly + oasMonthly + otherPensionMonthly) * 12 * inflationFactor
  const annualDrawdownNeeded = Math.max(0, futureDesiredIncome - futurePensionIncome)

  // Steps 9–11: required capital and gap (uses retirement-phase return rate)
  const requiredCapital = PV_annuity(returnRateRetirement, retirementYears, annualDrawdownNeeded)
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
  const projectionSeries = buildProjectionSeries(inputs, nestEgg, annualDrawdownNeeded)

  // Income breakdown at retirement (future dollars)
  const incomeBreakdown = {
    cpp: cppMonthly * 12 * inflationFactor,
    oas: oasMonthly * 12 * inflationFactor,
    pension: otherPensionMonthly * 12 * inflationFactor,
    drawdown: annualDrawdownNeeded,
  }

  // FIRE Number: portfolio needed using SWR rule (drawdown / SWR)
  const fireNumber = swrRate > 0 ? annualDrawdownNeeded / swrRate : 0
  // Today's-dollars FIRE number (before inflation)
  const fireNumberToday = swrRate > 0
    ? Math.max(0, desiredRetirementIncome - (cppMonthly + oasMonthly + otherPensionMonthly) * 12) / swrRate
    : 0
  // How far along: current savings as % of today's FIRE number
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
    futurePensionIncome,
    annualDrawdownNeeded,
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
