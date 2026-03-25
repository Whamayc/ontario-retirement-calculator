<script>
  let { recommendations = [] } = $props()
</script>

{#if recommendations.length > 0}
  <div class="recommendations-box" aria-label="Retirement plan recommendations">
    <h3>Recommendations to close the gap</h3>
    <ul>
      {#each recommendations as rec}
        <li>{rec.message}</li>
      {/each}
    </ul>
  </div>
{/if}
