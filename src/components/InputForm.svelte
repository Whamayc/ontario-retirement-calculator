<script>
  import SectionProfile from './SectionProfile.svelte'
  import SectionIncomeExpenses from './SectionIncomeExpenses.svelte'
  import SectionCore from './SectionCore.svelte'
  import SectionPension from './SectionPension.svelte'
  import SectionAssumptions from './SectionAssumptions.svelte'

  let { inputs = $bindable() } = $props()
</script>

<form aria-label="Retirement calculator inputs" onsubmit={(e) => e.preventDefault()}>
  <details class="form-section" open>
    <summary>Your Profile</summary>
    <SectionProfile bind:inputs />
  </details>

  <details class="form-section" open>
    <summary>Income &amp; Expenses</summary>
    <SectionIncomeExpenses bind:inputs />
  </details>

  <details class="form-section" open>
    <summary>Savings &amp; Assets</summary>
    <SectionCore bind:inputs />
  </details>

  <details class="form-section" open>
    <summary>Government &amp; Pension</summary>
    <SectionPension bind:inputs />
  </details>

  <details class="form-section">
    <summary>Assumptions</summary>
    <SectionAssumptions bind:inputs />
  </details>
</form>
