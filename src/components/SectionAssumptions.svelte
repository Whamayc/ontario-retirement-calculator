<script>
  let { inputs = $bindable() } = $props()

  // Display helpers for % fields
  let returnRatePct           = $derived(+(inputs.returnRate * 100).toFixed(1))
  let returnRateRetirementPct = $derived(+(inputs.returnRateRetirement * 100).toFixed(1))
  let inflationRatePct        = $derived(+(inputs.inflationRate * 100).toFixed(1))
  let stdDevPrePct            = $derived(+(inputs.stdDevPre * 100).toFixed(1))
  let stdDevPostPct           = $derived(+(inputs.stdDevPost * 100).toFixed(1))
  let swrPct                  = $derived(+(inputs.swrRate * 100).toFixed(1))

  function setReturnRate(e)           { inputs.returnRate = parseFloat(e.target.value) / 100 }
  function setReturnRateRetirement(e) { inputs.returnRateRetirement = parseFloat(e.target.value) / 100 }
  function setInflationRate(e)        { inputs.inflationRate = parseFloat(e.target.value) / 100 }
  function setStdDevPre(e)            { inputs.stdDevPre = parseFloat(e.target.value) / 100 }
  function setStdDevPost(e)           { inputs.stdDevPost = parseFloat(e.target.value) / 100 }
  function setSwr(e)                  { inputs.swrRate = parseFloat(e.target.value) / 100 }
</script>

<div class="section-body">
  <!-- Pre-retirement Return Rate -->
  <div class="field">
    <label for="returnRate">Investment Return — Before Retirement</label>
    <div class="slider-pair">
      <input
        type="range" id="returnRate-range"
        min="0" max="15" step="0.1"
        value={returnRatePct}
        aria-label="Expected annual investment return before retirement"
        oninput={setReturnRate}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="returnRate"
          min="0" max="15" step="0.1"
          inputmode="decimal"
          value={returnRatePct}
          aria-label="Expected annual investment return before retirement as a percentage"
          aria-describedby="returnRate-hint"
          oninput={setReturnRate}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint" id="returnRate-hint">Accumulation phase — typically a growth-oriented portfolio. Balanced portfolio: 5–7% nominal. Default: 6%.</span>
  </div>

  <!-- Post-retirement Return Rate -->
  <div class="field">
    <label for="returnRateRetirement">Investment Return — During Retirement</label>
    <div class="slider-pair">
      <input
        type="range" id="returnRateRetirement-range"
        min="0" max="15" step="0.1"
        value={returnRateRetirementPct}
        aria-label="Expected annual investment return during retirement"
        oninput={setReturnRateRetirement}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="returnRateRetirement"
          min="0" max="15" step="0.1"
          inputmode="decimal"
          value={returnRateRetirementPct}
          aria-label="Expected annual investment return during retirement as a percentage"
          aria-describedby="returnRateRetirement-hint"
          oninput={setReturnRateRetirement}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint" id="returnRateRetirement-hint">Drawdown phase — typically a more conservative, income-focused portfolio. Conservative portfolio: 3–5% nominal. Default: 4%.</span>
  </div>

  <!-- Inflation Rate -->
  <div class="field">
    <label for="inflationRate">Expected Annual Inflation Rate</label>
    <div class="slider-pair">
      <input
        type="range" id="inflationRate-range"
        min="0" max="10" step="0.1"
        value={inflationRatePct}
        aria-label="Expected annual inflation rate"
        oninput={setInflationRate}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="inflationRate"
          min="0" max="10" step="0.1"
          inputmode="decimal"
          value={inflationRatePct}
          aria-label="Expected annual inflation rate as a percentage"
          aria-describedby="inflationRate-hint"
          oninput={setInflationRate}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint" id="inflationRate-hint">Bank of Canada target: 2%. Toronto CPI historically ~2.5%.</span>
  </div>

  <!-- Safe Withdrawal Rate -->
  <div class="field">
    <label for="swrRate">Safe Withdrawal Rate (SWR)</label>
    <div class="slider-pair">
      <input
        type="range" id="swrRate-range"
        min="2" max="6" step="0.1"
        value={swrPct}
        aria-label="Safe withdrawal rate slider"
        oninput={setSwr}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="swrRate"
          min="2" max="6" step="0.1"
          inputmode="decimal"
          value={swrPct}
          aria-label="Safe withdrawal rate as a percentage"
          aria-describedby="swr-hint"
          oninput={setSwr}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint" id="swr-hint">Used to calculate your FIRE Number. 4% = classic Trinity Study (30yr). Use 3–3.5% for early retirement (40–50yr horizon). Default: 4%.</span>
  </div>

  <!-- Monte Carlo: Pre-retirement volatility -->
  <div class="field">
    <label for="stdDevPre">Return Volatility — Before Retirement</label>
    <div class="slider-pair">
      <input
        type="range" id="stdDevPre-range"
        min="0" max="30" step="0.5"
        value={stdDevPrePct}
        aria-label="Annual return volatility before retirement"
        oninput={setStdDevPre}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="stdDevPre"
          min="0" max="30" step="0.5"
          inputmode="decimal"
          value={stdDevPrePct}
          aria-label="Annual return volatility before retirement as a percentage"
          aria-describedby="stdDevPre-hint"
          oninput={setStdDevPre}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint" id="stdDevPre-hint">Monte Carlo only. Standard deviation of annual returns. Equity-heavy: ~15–18%. Balanced: ~10–12%. Default: 12%.</span>
  </div>

  <!-- Monte Carlo: Post-retirement volatility -->
  <div class="field">
    <label for="stdDevPost">Return Volatility — During Retirement</label>
    <div class="slider-pair">
      <input
        type="range" id="stdDevPost-range"
        min="0" max="20" step="0.5"
        value={stdDevPostPct}
        aria-label="Annual return volatility during retirement"
        oninput={setStdDevPost}
      />
      <div class="input-wrap has-suffix" style="width:6rem;flex-shrink:0">
        <input
          type="number" id="stdDevPost"
          min="0" max="20" step="0.5"
          inputmode="decimal"
          value={stdDevPostPct}
          aria-label="Annual return volatility during retirement as a percentage"
          aria-describedby="stdDevPost-hint"
          oninput={setStdDevPost}
        />
        <span class="suffix" aria-hidden="true">%</span>
      </div>
    </div>
    <span class="field-hint" id="stdDevPost-hint">Monte Carlo only. Conservative/income portfolio: ~6–10%. Default: 8%.</span>
  </div>

  <!-- Life Expectancy -->
  <div class="field">
    <label for="lifeExpectancy">Life Expectancy</label>
    <div class="slider-pair">
      <input
        type="range" id="lifeExpectancy-range"
        min="65" max="105" step="1"
        aria-label="Life expectancy in years"
        bind:value={inputs.lifeExpectancy}
      />
      <input
        type="number" id="lifeExpectancy"
        min="65" max="105" step="1"
        inputmode="numeric"
        aria-label="Life expectancy in years"
        aria-describedby="lifeExpectancy-hint"
        bind:value={inputs.lifeExpectancy}
      />
    </div>
    <span class="field-hint" id="lifeExpectancy-hint">Canadian average life expectancy at 65: ~86 (men), ~88 (women). Default: 90 for safety margin.</span>
  </div>
</div>
