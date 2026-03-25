const cadFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const cadFormatterDecimals = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCAD(n) {
  if (!isFinite(n)) return '$—'
  return cadFormatter.format(n)
}

export function formatCADDecimal(n) {
  if (!isFinite(n)) return '$—'
  return cadFormatterDecimals.format(n)
}

export function formatPercent(n) {
  if (!isFinite(n)) return '—%'
  return (n * 100).toFixed(1) + '%'
}

export function formatYears(n) {
  if (!isFinite(n) || n < 0) return '—'
  const rounded = Math.round(n)
  return rounded === 1 ? '1 year' : `${rounded} years`
}

export function formatAge(n) {
  return `age ${Math.round(n)}`
}
