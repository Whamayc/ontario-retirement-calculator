<script>
  let { inputs = $bindable() } = $props()

  function setInt(field, e) {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) {
      inputs[field] = v
      if (field === 'currentAge' && inputs.retirementAge <= v) {
        inputs.retirementAge = v + 1
      }
    }
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
        min={inputs.currentAge} max="80" step="1"
        value={inputs.retirementAge}
        aria-label="Desired retirement age slider"
        oninput={(e) => setInt('retirementAge', e)}
      />
      <input
        type="number" id="retirementAge"
        min={inputs.currentAge} max="80" step="1"
        inputmode="numeric"
        value={inputs.retirementAge}
        aria-label="Desired retirement age"
        oninput={(e) => setInt('retirementAge', e)}
      />
    </div>
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
