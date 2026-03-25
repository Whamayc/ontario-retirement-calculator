<script>
  import { formatCAD, formatPercent } from '../lib/formatters.js'
  import StatusBadge from './StatusBadge.svelte'
  import SummaryCards from './SummaryCards.svelte'
  import MetricsGrid from './MetricsGrid.svelte'
  import RecommendationsBox from './RecommendationsBox.svelte'

  let { results, inputs, mcResults = null } = $props()
</script>

<div
  class="results-panel card"
  aria-live="polite"
  aria-atomic="true"
  aria-label="Retirement projection results"
>
  <div class="results-header">
    <h2>Retirement Projection</h2>
    <StatusBadge status={results.status} />
    {#if mcResults}
      {@const pct = Math.round(mcResults.successRate * 100)}
      <span class="mc-badge" class:mc-green={pct >= 80} class:mc-amber={pct >= 60 && pct < 80} class:mc-red={pct < 60}>
        {pct}% success
      </span>
    {/if}
  </div>

  <SummaryCards {results} />

  <hr class="divider" />

  <MetricsGrid {results} />

  <hr class="divider" />

  <!-- Key projection details -->
  <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.9rem;color:var(--color-text-muted);margin-bottom:0.5rem">
    <div>
      <strong style="color:var(--color-text)">Years to retirement:</strong>
      {results.yearsToRetire} years (age {inputs.retirementAge})
    </div>
    <div>
      <strong style="color:var(--color-text)">Retirement duration:</strong>
      {results.retirementYears} years (to age {inputs.lifeExpectancy})
    </div>
    <div>
      <strong style="color:var(--color-text)">Inflation-adjusted income needed:</strong>
      {formatCAD(results.futureDesiredIncome)}/year at retirement
    </div>
    <div>
      <strong style="color:var(--color-text)">Pension income at retirement:</strong>
      {formatCAD(results.futurePensionIncome)}/year (CPP + OAS + pension, inflation-adjusted)
    </div>
    <div>
      <strong style="color:var(--color-text)">Annual portfolio drawdown needed:</strong>
      {formatCAD(results.annualDrawdownNeeded)}/year
    </div>
    <div>
      <strong style="color:var(--color-text)">Inflation factor over {results.yearsToRetire} years:</strong>
      ×{results.inflationFactor.toFixed(2)} ({formatPercent(inputs.inflationRate)}/year)
    </div>
  </div>

  <RecommendationsBox recommendations={results.recommendations} />
</div>
