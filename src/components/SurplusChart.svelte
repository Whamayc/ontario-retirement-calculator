<script>
  import { formatCAD } from '../lib/formatters.js'
  import ChartDataTable from './ChartDataTable.svelte'

  let { surplusShortfall = 0, requiredCapital = 0 } = $props()

  let nestEgg = $derived(requiredCapital + surplusShortfall)

  let funded = $derived(
    requiredCapital > 0
      ? Math.max(0, nestEgg / requiredCapital)
      : 1
  )

  let pct = $derived(Math.round(funded * 100))
  let barWidth = $derived(Math.min(funded, 1) * 100)

  let color = $derived(
    funded >= 1.0 ? 'var(--color-success)' :
    funded >= 0.8 ? 'var(--color-warning)' :
    'var(--color-danger)'
  )

  let bgColor = $derived(
    funded >= 1.0 ? 'var(--color-success-bg)' :
    funded >= 0.8 ? 'var(--color-warning-bg)' :
    'var(--color-danger-bg)'
  )

  let statusText = $derived(
    funded >= 1.0 ? 'On Track' :
    funded >= 0.8 ? 'Close' :
    'Off Track'
  )

  let label = $derived(surplusShortfall >= 0 ? 'Surplus' : 'Shortfall')

  let tableRows = $derived([
    ['Nest Egg',          formatCAD(nestEgg)],
    ['Required Capital',  formatCAD(requiredCapital)],
    [label,               formatCAD(Math.abs(surplusShortfall))],
    ['Funded',            pct + '%'],
  ])
</script>

<div class="chart-card kpi-card">
  <h3>Retirement Funding</h3>

  <!-- Primary KPI -->
  <div class="kpi-hero" style:background={bgColor}>
    <div class="kpi-pct" style:color>{pct}%</div>
    <div class="kpi-status" style:color>{statusText}</div>
  </div>

  <!-- Progress bar -->
  <div class="kpi-bar-track" aria-label="Funding progress: {pct}%">
    <div class="kpi-bar-fill" style:width="{barWidth}%" style:background={color}></div>
    <div class="kpi-bar-label kpi-bar-left">0%</div>
    <div class="kpi-bar-label kpi-bar-right">100%</div>
  </div>

  <!-- Supporting metrics -->
  <div class="kpi-metrics">
    <div class="kpi-metric">
      <span class="kpi-metric-label">Nest Egg</span>
      <span class="kpi-metric-value">{formatCAD(nestEgg)}</span>
    </div>
    <div class="kpi-metric">
      <span class="kpi-metric-label">Required Capital</span>
      <span class="kpi-metric-value">{formatCAD(requiredCapital)}</span>
    </div>
    <div class="kpi-metric kpi-metric-gap">
      <span class="kpi-metric-label">{label}</span>
      <span class="kpi-metric-value" style:color>{formatCAD(Math.abs(surplusShortfall))}</span>
    </div>
  </div>

  <ChartDataTable
    headers={['Metric', 'Amount']}
    rows={tableRows}
    caption="Retirement funding level and surplus or shortfall"
  />
</div>

<style>
  .kpi-card {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .kpi-hero {
    border-radius: var(--radius);
    padding: 1rem;
    text-align: center;
  }

  .kpi-pct {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
  }

  .kpi-status {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 0.25rem;
  }

  /* Progress bar */
  .kpi-bar-track {
    position: relative;
    height: 8px;
    background: var(--color-border);
    border-radius: 9999px;
    margin-top: 0.25rem;
    margin-bottom: 1.25rem;
  }

  .kpi-bar-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 300ms ease;
    min-width: 4px;
  }

  .kpi-bar-label {
    position: absolute;
    top: 0.75rem;
    font-size: 0.6875rem;
    color: var(--color-text-muted);
  }

  .kpi-bar-left  { left: 0; }
  .kpi-bar-right { right: 0; }

  /* Metrics rows */
  .kpi-metrics {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .kpi-metric {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.9rem;
  }

  .kpi-metric-label {
    color: var(--color-text-muted);
  }

  .kpi-metric-value {
    font-weight: 600;
    color: var(--color-text);
  }

  .kpi-metric-gap {
    border-top: 1px solid var(--color-border);
    padding-top: 0.5rem;
    margin-top: 0.125rem;
  }

  .kpi-metric-gap .kpi-metric-value {
    font-size: 1rem;
    font-weight: 700;
  }
</style>
