<script>
  import { onMount, onDestroy } from 'svelte'
  import { Chart } from 'chart.js/auto'
  import { formatCAD } from '../lib/formatters.js'
  import ChartDataTable from './ChartDataTable.svelte'

  let { mcResults = null, retirementAge = 65 } = $props()

  let canvas
  let chart

  function buildConfig(results) {
    const bands  = results.bands
    const labels = bands.map(d => d.age)
    const p10    = bands.map(d => d.p10)
    const p50    = bands.map(d => d.p50)
    const p90    = bands.map(d => d.p90)
    const retireIdx = bands.findIndex(d => d.age >= retirementAge)

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '_p10',
            data: p10,
            fill: false,
            borderColor: 'transparent',
            borderWidth: 0,
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: '80% Range (p10–p90)',
            data: p90,
            fill: '-1',
            backgroundColor: 'rgba(13,114,131,0.12)',
            borderColor: 'transparent',
            borderWidth: 0,
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: 'Median (p50)',
            data: p50,
            fill: false,
            borderColor: 'rgba(13,114,131,0.6)',
            borderWidth: 1.5,
            borderDash: [5, 3],
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11 }, boxWidth: 12,
              filter: item => item.label !== '_p10',
            },
          },
          tooltip: {
            filter: item => item.dataset.label !== '_p10',
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${formatCAD(ctx.raw)}`,
            },
          },
          annotation: retireIdx >= 0 ? {
            annotations: {
              retireLine: {
                type: 'line',
                xMin: retirementAge,
                xMax: retirementAge,
                borderColor: 'rgba(146,64,14,0.6)',
                borderWidth: 2,
                borderDash: [6, 3],
                label: {
                  display: true,
                  content: `Retire (${retirementAge})`,
                  position: 'start',
                  backgroundColor: 'rgba(146,64,14,0.7)',
                  color: '#fff',
                  font: { size: 11 },
                },
              },
            },
          } : undefined,
        },
        scales: {
          x: {
            title: { display: true, text: 'Age', color: '#6b7280', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { stepSize: 1 },
          },
          y: {
            title: { display: true, text: 'Portfolio Value (CAD)', color: '#6b7280', font: { size: 11 } },
            ticks: { callback: v => '$' + (v >= 1e6 ? (v/1e6).toFixed(1)+'M' : (v/1e3).toFixed(0)+'K') },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
        },
      },
    }
  }

  function updateChart(c, results) {
    const bands = results.bands
    c.data.labels          = bands.map(d => d.age)
    c.data.datasets[0].data = bands.map(d => d.p10)
    c.data.datasets[1].data = bands.map(d => d.p90)
    c.data.datasets[2].data = bands.map(d => d.p50)
    c.update('none')
  }

  onMount(() => {
    if (mcResults) chart = new Chart(canvas, buildConfig(mcResults))
  })

  $effect(() => {
    if (!chart || !mcResults) return
    updateChart(chart, mcResults)
  })

  onDestroy(() => chart?.destroy())

  let tableRows = $derived(
    mcResults
      ? mcResults.bands
          .filter((_, i) => i % 5 === 0 || i === mcResults.bands.length - 1)
          .map(d => [d.age, formatCAD(d.p10), formatCAD(d.p50), formatCAD(d.p90)])
      : []
  )
</script>

{#if mcResults}
  <div class="chart-card">
    <h3>Monte Carlo Projection — {Math.round(mcResults.successRate * 100)}% Success Rate</h3>
    <div
      class="chart-wrapper"
      role="img"
      aria-label="Fan chart showing Monte Carlo simulation range with 10th, 50th and 90th percentile outcomes"
      style="height: 260px"
    >
      <canvas bind:this={canvas}></canvas>
    </div>
    <p class="mc-note">
      {mcResults.n} simulations · ±12% return volatility pre-retirement · ±8% post-retirement
    </p>
    <ChartDataTable
      headers={['Age', 'Pessimistic (p10)', 'Median (p50)', 'Optimistic (p90)']}
      rows={tableRows}
      caption="Monte Carlo portfolio value percentiles by age"
    />
  </div>
{/if}

<style>
  .mc-note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 0.5rem;
  }
</style>
