<script>
  import { formatPercent } from '../lib/formatters.js'

  let { results } = $props()

  const metrics = $derived([
    {
      label:     'Savings Rate',
      value:     formatPercent(results.savingsRate),
      status:    results.savingsRate >= 0.15 ? 'green' : results.savingsRate >= 0.10 ? 'amber' : 'red',
      benchmark: 'Target ≥ 15% of gross income (Fidelity guideline)',
    },
    {
      label:     'Replacement Rate',
      value:     formatPercent(results.replacementRate),
      status:    results.replacementRate >= 0.70 ? 'green' : results.replacementRate >= 0.60 ? 'amber' : 'red',
      benchmark: 'Target 70–80% of pre-retirement income',
    },
    {
      label:     'Withdrawal Rate',
      value:     results.nestEgg > 0 ? formatPercent(results.actualWithdrawalRate) : '—',
      status:    results.nestEgg <= 0            ? 'neutral'
               : results.actualWithdrawalRate <= results.swrRate          ? 'green'
               : results.actualWithdrawalRate <= results.swrRate + 0.01   ? 'amber' : 'red',
      benchmark: `Your SWR is ${formatPercent(results.swrRate)} — at or below means sustainable`,
    },
    {
      label:     'Real Return (pre-ret.)',
      value:     formatPercent(results.realReturnPre),
      status:    results.realReturnPre >= 0.04 ? 'green' : results.realReturnPre >= 0.02 ? 'amber' : 'red',
      benchmark: 'Nominal return minus inflation — what actually grows your wealth',
    },
    {
      label:     'Real Return (in ret.)',
      value:     formatPercent(results.realReturnPost),
      status:    results.realReturnPost >= 0.02 ? 'green' : results.realReturnPost >= 0 ? 'amber' : 'red',
      benchmark: 'Should be positive to preserve purchasing power during drawdown',
    },
    {
      label:     'OAS Clawback Risk',
      value:     results.oasClawbackRisk ? 'At risk' : 'None',
      status:    results.oasClawbackRisk ? 'red' : 'green',
      benchmark: 'OAS clawback triggers above $148,451 net income (2026)',
    },
  ])
</script>

<div class="metrics-grid">
  {#each metrics as m}
    <div class="metric-card" data-status={m.status}>
      <span class="metric-label">{m.label}</span>
      <span class="metric-value">{m.value}</span>
      <span class="metric-bench">{m.benchmark}</span>
    </div>
  {/each}
</div>

<style>
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 0.625rem;
    margin-bottom: 1rem;
  }

  .metric-card {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.625rem 0.75rem;
    border-radius: var(--radius);
    border-left: 3px solid var(--m-color);
    background: color-mix(in srgb, var(--m-color) 6%, var(--color-surface-alt));
  }

  .metric-card[data-status='green']   { --m-color: var(--color-success, #16a34a); }
  .metric-card[data-status='amber']   { --m-color: var(--color-warning, #d97706); }
  .metric-card[data-status='red']     { --m-color: var(--color-danger,  #dc2626); }
  .metric-card[data-status='neutral'] { --m-color: var(--color-text-muted); }

  .metric-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
  }

  .metric-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--m-color);
    line-height: 1.1;
  }

  .metric-bench {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    line-height: 1.3;
  }
</style>
