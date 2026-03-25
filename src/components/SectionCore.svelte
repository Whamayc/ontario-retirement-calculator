<script>
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

  function setSalaryGrowth(e) {
    inputs.salaryGrowthRate = parseFloat(e.target.value) / 100
  }
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

  <!-- Annual Contribution -->
  <div class="field">
    <label for="annualContribution">Annual Retirement Contribution</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="annualContribution"
        min="0" max="200000" step="500"
        inputmode="decimal"
        value={inputs.annualContribution}
        aria-label="Annual contribution to retirement savings in Canadian dollars"
        oninput={(e) => setFloat('annualContribution', e)}
      />
    </div>
    <span class="field-hint">RRSP limit 2025: $32,490 · TFSA limit: $7,000</span>
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
