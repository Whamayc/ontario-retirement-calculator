<script>
  import { onMount, onDestroy } from 'svelte'
  import { Chart } from 'chart.js/auto'
  import { formatCAD } from '../lib/formatters.js'
  import ChartDataTable from './ChartDataTable.svelte'

  let { incomeBreakdown = { cpp: 0, oas: 0, pension: 0, drawdown: 0 } } = $props()

  let canvas
  let chart

  const COLORS = {
    cpp:      '#1a56db',
    oas:      '#0e9f6e',
    pension:  '#7e3af2',
    drawdown: '#e3a008',
  }

  function buildConfig(breakdown) {
    return {
      type: 'bar',
      data: {
        labels: ['Retirement Income Sources'],
        datasets: [
          { label: 'CPP',              data: [breakdown.cpp],      backgroundColor: COLORS.cpp      },
          { label: 'OAS',              data: [breakdown.oas],      backgroundColor: COLORS.oas      },
          { label: 'Other Pension',    data: [breakdown.pension],  backgroundColor: COLORS.pension  },
          { label: 'Portfolio Drawdown', data: [breakdown.drawdown], backgroundColor: COLORS.drawdown },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCAD(ctx.raw)}` } },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { callback: v => '$' + (v >= 1e6 ? (v/1e6).toFixed(1)+'M' : (v/1e3).toFixed(0)+'K') },
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
          y: { stacked: true, display: false },
        },
      },
    }
  }

  function updateChart(c, breakdown) {
    c.data.datasets[0].data = [breakdown.cpp]
    c.data.datasets[1].data = [breakdown.oas]
    c.data.datasets[2].data = [breakdown.pension]
    c.data.datasets[3].data = [breakdown.drawdown]
    c.update('none')
  }

  onMount(() => { chart = new Chart(canvas, buildConfig(incomeBreakdown)) })

  $effect(() => {
    if (!chart) return
    updateChart(chart, incomeBreakdown)
  })

  onDestroy(() => chart?.destroy())

  let tableRows = $derived([
    ['CPP',               formatCAD(incomeBreakdown.cpp)],
    ['OAS',               formatCAD(incomeBreakdown.oas)],
    ['Other Pension',     formatCAD(incomeBreakdown.pension)],
    ['Portfolio Drawdown',formatCAD(incomeBreakdown.drawdown)],
  ])
</script>

<div class="chart-card">
  <h3>Retirement Income Sources</h3>
  <div
    class="chart-wrapper"
    role="img"
    aria-label="Stacked bar chart showing retirement income broken down by CPP, OAS, other pension, and portfolio drawdown"
    style="height: 140px"
  >
    <canvas bind:this={canvas}></canvas>
  </div>
  <ChartDataTable
    headers={['Source', 'Annual Amount (future $)']}
    rows={tableRows}
    caption="Annual retirement income by source at retirement date"
  />
</div>
