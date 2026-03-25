import { runCalculations, runMonteCarlo } from './calculations.js'

onmessage = (event) => {
  const { type, inputs } = event.data
  try {
    if (type === 'runAll') {
      const results   = runCalculations(inputs)
      const mcResults = runMonteCarlo(inputs)
      postMessage({ type: 'results', results, mcResults })
    }
  } catch (err) {
    postMessage({ type: 'error', message: err.message })
  }
}
