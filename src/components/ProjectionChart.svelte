<script>
  import { onMount, onDestroy } from 'svelte'
  import { Chart } from 'chart.js/auto'
  import { formatCAD } from '../lib/formatters.js'
  import ChartDataTable from './ChartDataTable.svelte'

  let { projectionSeries = [], retirementAge = 65 } = $props()

  let canvas
  let chart

  function buildConfig(series, retAge) {
    const labels       = series.map(d => d.age)
    const contribs     = series.map(d => d.contributions)
    const interest     = series.map(d => d.interestEarned)
    const retireIdx    = series.findIndex(d => d.age >= retAge)

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Contributions',
            data: contribs,
            borderColor: '#1a56db',
            backgroundColor: 'rgba(26,86,219,0.25)',
            fill: true,
            stack: 'portfolio',
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
          {
            label: 'Interest / Returns',
            data: interest,
            borderColor: '#0e9f6e',
            backgroundColor: 'rgba(14,159,110,0.25)',
            fill: true,
            stack: 'portfolio',
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${formatCAD(ctx.raw)}`,
              footer: items => `Total: ${formatCAD(items.reduce((s, i) => s + i.raw, 0))}`,
            },
          },
          annotation: retireIdx >= 0 ? {
            annotations: {
              retireLine: {
                type: 'line',
                xMin: retAge,
                xMax: retAge,
                borderColor: 'rgba(146,64,14,0.6)',
                borderWidth: 2,
                borderDash: [6, 3],
                label: {
                  display: true,
                  content: `Retire (${retAge})`,
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
            stacked: true,
            title: { display: true, text: 'Portfolio Value (CAD)', color: '#6b7280', font: { size: 11 } },
            ticks: { callback: v => '$' + (v >= 1e6 ? (v/1e6).toFixed(1)+'M' : (v/1e3).toFixed(0)+'K') },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
        },
      },
    }
  }

  function updateChart(c, series) {
    c.data.labels            = series.map(d => d.age)
    c.data.datasets[0].data  = series.map(d => d.contributions)
    c.data.datasets[1].data  = series.map(d => d.interestEarned)
    c.update('none')
  }

  onMount(() => {
    chart = new Chart(canvas, buildConfig(projectionSeries, retirementAge))
  })

  $effect(() => {
    if (!chart) return
    updateChart(chart, projectionSeries)
  })

  onDestroy(() => chart?.destroy())

  // Accessible table data
  let tableRows = $derived(
    projectionSeries
      .filter((_, i) => i % 5 === 0 || i === projectionSeries.length - 1)
      .map(d => [d.age, formatCAD(d.contributions), formatCAD(d.interestEarned), formatCAD(d.portfolioValue)])
  )
</script>

<div class="chart-card">
  <h3>Portfolio Growth Over Time</h3>
  <div
    class="chart-wrapper"
    role="img"
    aria-label="Line chart showing projected portfolio value from current age to life expectancy"
    style="height: 260px"
  >
    <canvas bind:this={canvas}></canvas>
  </div>
  <ChartDataTable
    headers={['Age', 'Contributions', 'Interest / Returns', 'Total']}
    rows={tableRows}
    caption="Projected portfolio value by age, split by contributions and returns"
  />
</div>
