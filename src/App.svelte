<script>
  import { APP_DEFAULTS, DATA_FRESHNESS_NOTE } from './lib/constants.js'
  import { runCalculations, runMonteCarlo } from './lib/calculations.js'
  import CalcWorker from './lib/calc.worker?worker'
  import InputForm from './components/InputForm.svelte'
  import ResultsPanel from './components/ResultsPanel.svelte'
  import ProjectionChart from './components/ProjectionChart.svelte'
  import IncomeSourcesChart from './components/IncomeSourcesChart.svelte'
  import SurplusChart from './components/SurplusChart.svelte'
  import MonteCarloChart from './components/MonteCarloChart.svelte'

  const STORAGE_KEY = 'retirement-calc-inputs'

  function loadInputs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...APP_DEFAULTS, ...JSON.parse(saved) }
    } catch {}
    return { ...APP_DEFAULTS }
  }

  function saveInputs(vals) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vals)) } catch {}
  }

  let inputs    = $state(loadInputs())
  // Seed synchronously so the UI is never blank on first paint
  let results   = $state(runCalculations({ ...inputs }))
  let mcResults = $state(runMonteCarlo({ ...inputs }))

  // Worker runs calculations off the main thread — UI stays responsive at all times
  const worker = new CalcWorker()
  worker.onmessage = (e) => {
    if (e.data.type === 'results') {
      results   = e.data.results
      mcResults = e.data.mcResults
    }
  }

  // Debounce: wait until user stops interacting, then dispatch to worker
  $effect(() => {
    const snap = { ...inputs }
    const t = setTimeout(() => {
      worker.postMessage({ type: 'runAll', inputs: snap })
      saveInputs(snap)
    }, 150)
    return () => clearTimeout(t)
  })

  $effect(() => () => worker.terminate())
</script>

<div class="app-shell">
  <header class="app-header">
    <h1>Ontario Retirement Calculator</h1>
    <p class="subtitle">Project your retirement readiness based on your personal finances — built for Ontario residents.</p>
  </header>

  <div class="main-grid">
    <div class="sticky-panel">
      <InputForm bind:inputs />
    </div>
    <div class="right-col">
      <ResultsPanel {results} {inputs} {mcResults} />
      <div class="charts-grid">
        <ProjectionChart projectionSeries={results.projectionSeries} retirementAge={inputs.retirementAge} />
        <MonteCarloChart {mcResults} retirementAge={inputs.retirementAge} />
        <IncomeSourcesChart incomeBreakdown={results.incomeBreakdown} />
        <SurplusChart surplusShortfall={results.surplusShortfall} requiredCapital={results.requiredCapital} />
      </div>
    </div>
  </div>

  <footer class="app-footer">
    <p>{DATA_FRESHNESS_NOTE}</p>
  </footer>
</div>
