<script>
  import { CPP, OAS } from '../lib/constants.js'
  let { inputs = $bindable() } = $props()
</script>

<div class="section-body">
  <!-- CPP -->
  <div class="field">
    <label for="cppMonthly">CPP Monthly Amount</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="cppMonthly"
        min="0" max="2000" step="10"
        inputmode="decimal"
        aria-label="Monthly CPP benefit in Canadian dollars"
        aria-describedby="cpp-hint"
        bind:value={inputs.cppMonthly}
      />
    </div>
    <span class="field-hint" id="cpp-hint">
      2026 max: ${CPP.MAX_MONTHLY_2026.toFixed(2)}/mo · 2025 avg: ${CPP.AVG_MONTHLY_2025.toFixed(2)}/mo.
      Check your <a href="https://www.canada.ca/en/employment-social-development/services/my-account.html" target="_blank" rel="noopener">My Service Canada Account</a>.
      Early at 60: −36% · Late at 70: +42%.
    </span>
  </div>

  <!-- OAS -->
  <div class="field">
    <label for="oasMonthly">OAS Monthly Amount</label>
    <div class="input-wrap has-prefix">
      <span class="prefix" aria-hidden="true">$</span>
      <input
        type="number" id="oasMonthly"
        min="0" max="1500" step="10"
        inputmode="decimal"
        aria-label="Monthly OAS benefit in Canadian dollars"
        aria-describedby="oas-hint"
        bind:value={inputs.oasMonthly}
      />
    </div>
    <span class="field-hint" id="oas-hint">
      Q1 2026 max: ${OAS.MONTHLY_65_74.toFixed(2)}/mo (ages 65–74) · ${OAS.MONTHLY_75_PLUS.toFixed(2)}/mo (75+).
      Clawback starts at $148,451/year net income.
      Set to $0 if retiring before age 65.
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
        aria-label="Monthly income from other pension sources in Canadian dollars"
        aria-describedby="pension-hint"
        bind:value={inputs.otherPensionMonthly}
      />
    </div>
    <span class="field-hint" id="pension-hint">Company defined-benefit pension, annuity, or other guaranteed income.</span>
  </div>
</div>
