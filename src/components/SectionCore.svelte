<script>
  import { estimateTakeHome } from '../lib/calculations.js'
  import { RRSP, TFSA } from '../lib/constants.js'

  let { inputs = $bindable() } = $props()

  function setInt(field, e) {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) inputs[field] = v
  }

  function setFloat(field, e) {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) inputs[field] = v
  }

  let salaryGrowthPct = $derived(+(inputs.salaryGrowthRate * 100).toFixed(1))
  function setSalaryGrowth(e) { inputs.salaryGrowthRate = parseFloat(e.target.value) / 100 }

  // Contribution frequency options
  const FREQUENCIES = [
    { key: 'weekly',    label: 'Weekly',    periods: 52  },
    { key: 'biweekly',  label: 'Bi-weekly', periods: 26  },
    { key: 'monthly',   label: 'Monthly',   periods: 12  },
    { key: 'quarterly', label: 'Quarterly', periods: 4   },
    { key: 'annually',  label: 'Annually',  periods: 1   },
  ]

  function periodsFor(freqKey) {
    return FREQUENCIES.find(f => f.key === freqKey)?.periods ?? 1
  }

  // Per-account annual totals for hints
  let rrspAnnual    = $derived(inputs.rrspContribution    * periodsFor(inputs.rrspFrequency))
  let tfsaAnnual    = $derived(inputs.tfsaContribution    * periodsFor(inputs.tfsaFrequency))
  let nonRegAnnual  = $derived(inputs.nonRegContribution  * periodsFor(inputs.nonRegFrequency))
  let totalAnnual   = $derived(rrspAnnual + tfsaAnnual + nonRegAnnual)

  // Estimated take-home: pre-tax income minus federal + Ontario tax, with RRSP deduction
  let takeHome      = $derived(estimateTakeHome(inputs.annualIncome, rrspAnnual))

  // RRSP contribution limit: lesser of 18% of earned income or CRA 2026 annual cap
  let rrspLimit     = $derived(Math.min(Math.floor(inputs.annualIncome * 0.18), RRSP.ANNUAL_LIMIT_2026))
</script>

<div class="section-body">
  <!-- Current Age -->
  <div class="field">
    <label for="currentAge">Current Age</label>
    <div class="slider-pair">
      <input
        type="range"
        min="18" max="80" step="1"
        value={inputs.currentAge}
        aria-label="Current age slider"
        oninput={(e) => setInt('currentAge', e)}
      />
      <input
        type="number" id="currentAge"
        min="18" max="80" step="1"
        inputmode="numeric"
        value={inputs.currentAge}
        aria-label="Current age in years"
        oninput={(e) => setInt('currentAge', e)}
      />
    </div>
  </div>

  <!-- Retirement Age -->
  <div class="field">
    <label for="retirementAge">Desired Retirement Age</label>
    <div class="slider-pair">
      <input
        type="range"
        min="45" max="80" step="1"
        value={inputs.retirementAge}
        aria-label="Desired retirement age slider"
        oninput={(e) => setInt('retirementAge', e)}
      />
      <input
        type="number" id="retirementAge"
        min="45" max="80" step="1"
        inputmode="numeric"
        value={inputs.retirementAge}
        aria-label="Desired retirement age"
        oninput={(e) => setInt('retirementAge', e)}
      />
    </div>
  </div>

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

  <!-- Annual Income -->
  <div class="field">
    <label for="annualIncome">Annual Pre-Tax Income</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="annualIncome"
        min="0" max="2000000" step="1000"
        inputmode="decimal"
        value={inputs.annualIncome}
        aria-label="Annual pre-tax income in Canadian dollars"
        oninput={(e) => setFloat('annualIncome', e)}
      />
    </div>
    <span class="field-hint">
      Est. take-home after tax &amp; RRSP contribution (${rrspAnnual.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/yr):
      <strong>${takeHome.toLocaleString('en-CA', { maximumFractionDigits: 0 })}/year</strong>
      · <strong>${Math.round(takeHome / 12).toLocaleString('en-CA')}/month</strong>
      (federal + Ontario incl. surtax, BPA credits, CPP &amp; EI; excl. Ontario Health Premium)
    </span>
  </div>

  <!-- Annual Expenses -->
  <div class="field">
    <label for="annualExpenses">Annual Living Expenses</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="annualExpenses"
        min="0" max="2000000" step="1000"
        inputmode="decimal"
        value={inputs.annualExpenses}
        aria-label="Annual living expenses in Canadian dollars"
        oninput={(e) => setFloat('annualExpenses', e)}
      />
    </div>
    <span class="field-hint">Toronto single person all-in avg: ~$46,116/year</span>
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

  <!-- Desired Retirement Income -->
  <div class="field">
    <label for="desiredRetirementIncome">Desired Annual Retirement Income</label>
    <div class="input-wrap has-prefix has-suffix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="desiredRetirementIncome"
        min="0" max="1000000" step="1000"
        inputmode="decimal"
        value={inputs.desiredRetirementIncome}
        aria-describedby="desiredRetirementIncome-hint"
        aria-label="Desired annual retirement income in today's Canadian dollars"
        oninput={(e) => setFloat('desiredRetirementIncome', e)}
      />
      <span class="suffix" aria-hidden="true">today $</span>
    </div>
    <span class="field-hint" id="desiredRetirementIncome-hint">In today's dollars — will be adjusted for inflation.</span>
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

  .freq-toggle button:last-child {
    border-right: none;
  }

  .freq-toggle button.active {
    background: var(--color-primary);
    color: #fff;
    font-weight: 600;
  }

  .freq-toggle button:hover:not(.active) {
    background: var(--color-border);
  }

</style>
