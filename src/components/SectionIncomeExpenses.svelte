<script>
  import { estimateTakeHome, grossUpRetirementIncome, periodsFor } from '../lib/calculations.js'

  let { inputs = $bindable() } = $props()

  function setFloat(field, e) {
    const raw = e.target.value
    const v = raw === '' ? 0 : parseFloat(raw)
    inputs[field] = isNaN(v) ? 0 : v
  }

  let rrspAnnual                = $derived((inputs.rrspContribution ?? 0) * periodsFor(inputs.rrspFrequency ?? 'annually'))
  let takeHome                  = $derived(estimateTakeHome(inputs.annualIncome, rrspAnnual))
  let suggestedRetirementIncome = $derived(grossUpRetirementIncome(inputs.annualExpenses))
</script>

<div class="section-body">
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
    <span class="field-hint" id="desiredRetirementIncome-hint">
      In today's dollars — will be adjusted for inflation.
      Suggested: <strong>${suggestedRetirementIncome.toLocaleString('en-CA')}/yr</strong>
      (your living expenses after tax, grossed up to pre-tax)
    </span>
  </div>
</div>
