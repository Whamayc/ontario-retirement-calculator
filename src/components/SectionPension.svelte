<script>
  import { CPP, OAS } from '../lib/constants.js'
  let { inputs = $bindable() } = $props()

  // Live-computed adjusted monthly amounts based on chosen start ages
  let adjCPPFactor  = $derived(
    inputs.cppStartAge < 65
      ? 1 + (inputs.cppStartAge - 65) * 12 * CPP.EARLY_REDUCTION_PER_MONTH
      : 1 + (inputs.cppStartAge - 65) * 12 * CPP.LATE_ENHANCEMENT_PER_MONTH
  )
  let adjCPPMonthly = $derived(+(inputs.cppMonthly * adjCPPFactor).toFixed(0))
  let cppAdjPct     = $derived(+((adjCPPFactor - 1) * 100).toFixed(1))

  let adjOASFactor  = $derived(
    inputs.oasStartAge <= 65 ? 1 : 1 + (inputs.oasStartAge - 65) * 12 * 0.006
  )
  let adjOASMonthly = $derived(+(inputs.oasMonthly * adjOASFactor).toFixed(0))
  let oasAdjPct     = $derived(+((adjOASFactor - 1) * 100).toFixed(1))
</script>

<div class="section-body">
  <!-- CPP -->
  <div class="field">
    <label for="cppMonthly">CPP Monthly Benefit (base at age 65)</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="cppMonthly"
        min="0" max="2000" step="10"
        inputmode="decimal"
        aria-label="Monthly CPP benefit at age 65"
        aria-describedby="cpp-hint"
        bind:value={inputs.cppMonthly}
      />
    </div>
    <span class="field-hint" id="cpp-hint">
      2026 max: ${CPP.MAX_MONTHLY_2026.toFixed(2)}/mo · 2025 avg: ${CPP.AVG_MONTHLY_2025.toFixed(2)}/mo.
      Check your <a href="https://www.canada.ca/en/employment-social-development/services/my-account.html" target="_blank" rel="noopener">My Service Canada Account</a>.
    </span>
  </div>

  <!-- CPP Start Age -->
  <div class="field">
    <label for="cppStartAge">CPP Start Age</label>
    <div class="slider-pair">
      <input
        type="range" id="cppStartAge-range"
        min="60" max="70" step="1"
        aria-label="Age to start receiving CPP"
        bind:value={inputs.cppStartAge}
      />
      <input
        type="number" id="cppStartAge"
        min="60" max="70" step="1"
        inputmode="numeric"
        aria-label="Age to start receiving CPP"
        aria-describedby="cppStartAge-hint"
        bind:value={inputs.cppStartAge}
      />
    </div>
    <span class="field-hint pension-adj" id="cppStartAge-hint">
      {#if inputs.cppStartAge < 65}
        <span class="adj-badge adj-down">−{Math.abs(cppAdjPct)}% reduction</span>
        Adjusted benefit: <strong>${adjCPPMonthly}/mo</strong>
      {:else if inputs.cppStartAge > 65}
        <span class="adj-badge adj-up">+{cppAdjPct}% enhancement</span>
        Adjusted benefit: <strong>${adjCPPMonthly}/mo</strong>
      {:else}
        Standard age 65 · no adjustment — <strong>${adjCPPMonthly}/mo</strong>
      {/if}
    </span>
  </div>

  <!-- OAS -->
  <div class="field">
    <label for="oasMonthly">OAS Monthly Benefit (base at age 65)</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="oasMonthly"
        min="0" max="1500" step="10"
        inputmode="decimal"
        aria-label="Monthly OAS benefit at age 65"
        aria-describedby="oas-hint"
        bind:value={inputs.oasMonthly}
      />
    </div>
    <span class="field-hint" id="oas-hint">
      Q1 2026 max: ${OAS.MONTHLY_65_74.toFixed(2)}/mo (ages 65–74) · ${OAS.MONTHLY_75_PLUS.toFixed(2)}/mo (75+).
      Clawback starts at $148,451/year net income.
    </span>
  </div>

  <!-- OAS Start Age -->
  <div class="field">
    <label for="oasStartAge">OAS Start Age</label>
    <div class="slider-pair">
      <input
        type="range" id="oasStartAge-range"
        min="65" max="70" step="1"
        aria-label="Age to start receiving OAS"
        bind:value={inputs.oasStartAge}
      />
      <input
        type="number" id="oasStartAge"
        min="65" max="70" step="1"
        inputmode="numeric"
        aria-label="Age to start receiving OAS"
        aria-describedby="oasStartAge-hint"
        bind:value={inputs.oasStartAge}
      />
    </div>
    <span class="field-hint pension-adj" id="oasStartAge-hint">
      {#if inputs.oasStartAge > 65}
        <span class="adj-badge adj-up">+{oasAdjPct}% deferral bonus</span>
        Adjusted benefit: <strong>${adjOASMonthly}/mo</strong>
      {:else}
        No deferral — OAS starts at 65 · <strong>${adjOASMonthly}/mo</strong>
      {/if}
    </span>
  </div>

  <!-- Other Pension -->
  <div class="field">
    <label for="otherPensionMonthly">Other Pension Monthly Amount</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="otherPensionMonthly"
        min="0" max="20000" step="50"
        inputmode="decimal"
        aria-label="Monthly income from other pension sources"
        aria-describedby="pension-hint"
        bind:value={inputs.otherPensionMonthly}
      />
    </div>
    <span class="field-hint" id="pension-hint">Company defined-benefit pension, annuity, or other guaranteed income.</span>
  </div>
</div>

<style>
  .pension-adj {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .adj-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .adj-up {
    background: color-mix(in srgb, var(--color-success) 15%, transparent);
    color: var(--color-success);
  }

  .adj-down {
    background: color-mix(in srgb, var(--color-danger) 15%, transparent);
    color: var(--color-danger);
  }
</style>
