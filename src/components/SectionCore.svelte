<script>
  import { estimateTakeHome, periodsFor } from '../lib/calculations.js'
  import { RRSP, TFSA } from '../lib/constants.js'

  let { inputs = $bindable() } = $props()

  function setFloat(field, e) {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) inputs[field] = v
  }

  const FREQUENCIES = [
    { key: 'weekly',    label: 'Weekly'    },
    { key: 'biweekly',  label: 'Bi-weekly' },
    { key: 'monthly',   label: 'Monthly'   },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'annually',  label: 'Annually'  },
  ]

  let salaryGrowthPct = $derived(+(inputs.salaryGrowthRate * 100).toFixed(1))
  function setSalaryGrowth(e) { inputs.salaryGrowthRate = parseFloat(e.target.value) / 100 }

  let rrspAnnual    = $derived(inputs.rrspContribution   * periodsFor(inputs.rrspFrequency))
  let tfsaAnnual    = $derived(inputs.tfsaContribution   * periodsFor(inputs.tfsaFrequency))
  let nonRegAnnual  = $derived(inputs.nonRegContribution * periodsFor(inputs.nonRegFrequency))
  let totalAnnual   = $derived(rrspAnnual + tfsaAnnual + nonRegAnnual)
  let takeHome      = $derived(estimateTakeHome(inputs.annualIncome, rrspAnnual))
  let rrspLimit     = $derived(Math.min(Math.floor(inputs.annualIncome * 0.18), RRSP.ANNUAL_LIMIT_2026))
  let annualSurplus = $derived(takeHome - inputs.annualExpenses - tfsaAnnual - nonRegAnnual)
</script>

<div class="section-body">
  <!-- Current Savings -->
  <div class="field">
    <label for="currentSavings">Current Retirement Savings</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="currentSavings"
        min="0" max="10000000" step="1000"
        inputmode="decimal"
        value={inputs.currentSavings}
        aria-label="Current retirement savings in Canadian dollars"
        oninput={(e) => setFloat('currentSavings', e)}
      />
    </div>
  </div>

  <!-- Other Net Assets -->
  <div class="field">
    <label for="otherNetAssets">Other Net Assets for Retirement</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="otherNetAssets"
        min="0" max="10000000" step="1000"
        inputmode="decimal"
        value={inputs.otherNetAssets}
        aria-label="Other net assets in Canadian dollars"
        oninput={(e) => setFloat('otherNetAssets', e)}
      />
    </div>
    <span class="field-hint">
      Your estimated value of these assets at retirement — e.g. home equity (expected market value minus remaining mortgage), rental property, or other alternative investments you plan to liquidate.
      Enter the value you expect to have at retirement; it is added directly to your nest egg without further growth.
    </span>
  </div>

  <!-- RRSP Contribution -->
  <div class="field">
    <label for="rrspContribution">RRSP Contribution</label>
    <div class="contrib-row">
      <div class="input-wrap has-prefix" style="width: 10rem; flex-shrink: 0">
        <span class="prefix" aria-hidden="true">$</span>
        <input
          type="number" id="rrspContribution"
          min="0" max="100000" step="10"
          inputmode="decimal"
          value={inputs.rrspContribution}
          aria-label="RRSP contribution per period"
          oninput={(e) => setFloat('rrspContribution', e)}
        />
      </div>
      <div class="freq-toggle">
        {#each FREQUENCIES as f}
          <button
            type="button"
            class:active={inputs.rrspFrequency === f.key}
            onclick={() => inputs.rrspFrequency = f.key}
          >{f.label}</button>
        {/each}
      </div>
    </div>
    <span class="field-hint">
      {#if periodsFor(inputs.rrspFrequency) !== 1}
        = <strong>${rrspAnnual.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/year</strong> ·
      {/if}
      2026 limit: <strong>${rrspLimit.toLocaleString('en-CA')}/yr</strong>
      (18% of income{inputs.annualIncome * 0.18 > RRSP.ANNUAL_LIMIT_2026 ? `, capped at CRA max $${RRSP.ANNUAL_LIMIT_2026.toLocaleString('en-CA')}` : ''})
    </span>
  </div>

  <!-- TFSA Contribution -->
  <div class="field">
    <label for="tfsaContribution">TFSA Contribution</label>
    <div class="contrib-row">
      <div class="input-wrap has-prefix" style="width: 10rem; flex-shrink: 0">
        <span class="prefix" aria-hidden="true">$</span>
        <input
          type="number" id="tfsaContribution"
          min="0" max="100000" step="10"
          inputmode="decimal"
          value={inputs.tfsaContribution}
          aria-label="TFSA contribution per period"
          oninput={(e) => setFloat('tfsaContribution', e)}
        />
      </div>
      <div class="freq-toggle">
        {#each FREQUENCIES as f}
          <button
            type="button"
            class:active={inputs.tfsaFrequency === f.key}
            onclick={() => inputs.tfsaFrequency = f.key}
          >{f.label}</button>
        {/each}
      </div>
    </div>
    <span class="field-hint">
      {#if periodsFor(inputs.tfsaFrequency) !== 1}
        = <strong>${tfsaAnnual.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/year</strong> ·
      {/if}
      2026 limit: ${TFSA.ANNUAL_LIMIT_2026.toLocaleString('en-CA')}/yr
    </span>
  </div>

  <!-- Non-Registered Contribution -->
  <div class="field">
    <label for="nonRegContribution">Non-Registered Contribution</label>
    <div class="contrib-row">
      <div class="input-wrap has-prefix" style="width: 10rem; flex-shrink: 0">
        <span class="prefix" aria-hidden="true">$</span>
        <input
          type="number" id="nonRegContribution"
          min="0" max="100000" step="10"
          inputmode="decimal"
          value={inputs.nonRegContribution}
          aria-label="Non-registered contribution per period"
          oninput={(e) => setFloat('nonRegContribution', e)}
        />
      </div>
      <div class="freq-toggle">
        {#each FREQUENCIES as f}
          <button
            type="button"
            class:active={inputs.nonRegFrequency === f.key}
            onclick={() => inputs.nonRegFrequency = f.key}
          >{f.label}</button>
        {/each}
      </div>
    </div>
    <span class="field-hint">
      {#if periodsFor(inputs.nonRegFrequency) !== 1}
        = <strong>${nonRegAnnual.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/year</strong> ·
      {/if}
      Total all accounts: <strong>${totalAnnual.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/year</strong>
      <br>Annual {annualSurplus >= 0 ? 'surplus' : 'deficit'}:
      <strong class={annualSurplus >= 0 ? 'surplus' : 'deficit'}>
        {annualSurplus >= 0 ? '+' : '−'}${Math.abs(Math.round(annualSurplus)).toLocaleString('en-CA')}/yr
        ({annualSurplus >= 0 ? '+' : '−'}${Math.abs(Math.round(annualSurplus / 12)).toLocaleString('en-CA')}/mo)
      </strong>
    </span>
  </div>

  <!-- Salary Growth Rate -->
  <div class="field">
    <label for="salaryGrowthRate">Annual Salary Growth Rate</label>
    <div class="slider-pair">
      <input
        type="range" id="salaryGrowthRate-range"
        min="0" max="10" step="0.1"
        value={salaryGrowthPct}
        aria-label="Expected annual salary growth rate slider"
        oninput={setSalaryGrowth}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="salaryGrowthRate"
          min="0" max="10" step="0.1"
          inputmode="decimal"
          value={salaryGrowthPct}
          aria-label="Expected annual salary growth rate as a percentage"
          oninput={setSalaryGrowth}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint">Your contribution grows by this % each year. Blended lifetime avg: ~2–3% nominal. Set to 0% to keep contributions fixed.</span>
  </div>
</div>

<style>
  .contrib-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .freq-toggle {
    display: flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .freq-toggle button {
    padding: 0.375rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 500;
    background: var(--color-surface-alt);
    color: var(--color-text-muted);
    border: none;
    border-right: 1px solid var(--color-border);
    cursor: pointer;
    transition: background 150ms, color 150ms;
    white-space: nowrap;
  }

  .freq-toggle button:last-child { border-right: none; }

  .freq-toggle button.active {
    background: var(--color-primary);
    color: #fff;
    font-weight: 600;
  }

  .freq-toggle button:hover:not(.active) { background: var(--color-border); }

  .surplus { color: var(--color-green, #16a34a); }
  .deficit  { color: var(--color-red,   #dc2626); }
</style>
