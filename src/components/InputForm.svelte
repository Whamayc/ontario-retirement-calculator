<script>
  import SectionCore from './SectionCore.svelte'
  import SectionAssumptions from './SectionAssumptions.svelte'
  import SectionPension from './SectionPension.svelte'

  let { inputs = $bindable() } = $props()
</script>

<form aria-label="Retirement calculator inputs" onsubmit={(e) => e.preventDefault()}>
  <details class="form-section" open>
    <summary>Your Financial Profile</summary>
    <SectionCore bind:inputs />
  </details>

  <details class="form-section">
    <summary>Growth Assumptions</summary>
    <SectionAssumptions bind:inputs />
  </details>

  <details class="form-section">
    <summary>Government &amp; Pension Income</summary>
    <SectionPension bind:inputs />
  </details>
</form>
