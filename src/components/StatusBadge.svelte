<script>
  let { status = 'green' } = $props()

  const labels = {
    green: 'On Track',
    amber: 'Needs Attention',
    red:   'Action Required',
  }
</script>

<span class="status-badge {status}" role="status" aria-live="polite">
  {labels[status] ?? 'Unknown'}
</span>
