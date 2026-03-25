<script>
  import { formatCAD, formatPercent } from '../lib/formatters.js'
  let { results } = $props()

  let surplusClass = $derived(
    results.surplusShortfall >= 0 ? 'success' :
    results.status === 'amber'   ? 'warning' : 'danger'
  )

  let surplusLabel = $derived(results.surplusShortfall >= 0 ? 'Surplus' : 'Shortfall')

  let fireBarWidth = $derived(Math.min(results.fireProgress * 100, 100))
  let fireBarColor = $derived(
    results.fireProgress >= 1.0 ? 'var(--color-success)' :
    results.fireProgress >= 0.5 ? 'var(--color-warning)' :
    'var(--color-danger)'
  )
</script>

<div class="summary-cards">
  <div class="card">
    <div class="card-title">Projected Nest Egg</div>
    <div class="card-value">{formatCAD(results.nestEgg)}</div>
    <div class="card-sub">at retirement (future $)</div>
  </div>

  <div class="card">
    <div class="card-title">Required Capital</div>
    <div class="card-value">{formatCAD(results.requiredCapital)}</div>
    <div class="card-sub">to fund retirement income</div>
  </div>

  <div class="card {surplusClass}">
    <div class="card-title">{surplusLabel}</div>
    <div class="card-value">{formatCAD(Math.abs(results.surplusShortfall))}</div>
    <div class="card-sub">{results.surplusShortfall >= 0 ? 'above target' : 'below target'}</div>
  </div>
</div>

<!-- FIRE Number row -->
<div class="fire-row">
  <div class="fire-meta">
    <span class="fire-label">FIRE Number</span>
    <span class="fire-hint">({formatPercent(results.swrRate)} SWR · today's $)</span>
    <span class="fire-value">{formatCAD(results.fireNumberToday)}</span>
  </div>
  <div class="fire-progress-wrap">
    <div class="fire-progress-track" aria-label="FIRE progress: {Math.round(results.fireProgress * 100)}%">
      <div class="fire-progress-fill" style:width="{fireBarWidth}%" style:background={fireBarColor}></div>
    </div>
    <span class="fire-progress-pct" style:color={fireBarColor}>
      {Math.round(results.fireProgress * 100)}% there
    </span>
  </div>
</div>

<style>
  .fire-row {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    margin-bottom: 0.75rem;
  }

  .fire-meta {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .fire-label {
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }

  .fire-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .fire-value {
    margin-left: auto;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .fire-progress-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .fire-progress-track {
    flex: 1;
    height: 8px;
    background: var(--color-border);
    border-radius: 9999px;
    overflow: hidden;
  }

  .fire-progress-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 300ms ease;
    min-width: 3px;
  }

  .fire-progress-pct {
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
    min-width: 4.5rem;
    text-align: right;
  }
</style>
