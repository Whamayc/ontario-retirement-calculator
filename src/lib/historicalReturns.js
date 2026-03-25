// S&P 500 Annual Total Returns (price + dividends reinvested), 1926–2024
// Sources: Ibbotson SBBI, Damodaran (NYU Stern), Robert Shiller data
// Used for historical bootstrapping in Monte Carlo simulation.
// Each value is the arithmetic annual return as a decimal (e.g. 0.1162 = +11.62%)

export const SP500_ANNUAL_RETURNS = [
  // 1926–1929
   0.1162,  0.3749,  0.4361, -0.0842,
  // 1930–1939
  -0.2490, -0.4334, -0.0819,  0.5399, -0.0144,  0.4767,
   0.3392, -0.3503,  0.3112, -0.0041,
  // 1940–1949
  -0.0978, -0.1159,  0.2034,  0.2590,  0.1975,  0.3644,
  -0.0807,  0.0571,  0.0550,  0.1879,
  // 1950–1959
   0.3171,  0.2402,  0.1837, -0.0099,  0.5262,  0.3156,
   0.0656, -0.1078,  0.4336,  0.1196,
  // 1960–1969
   0.0047,  0.2689, -0.0873,  0.2280,  0.1648,  0.1245,
  -0.1006,  0.2398,  0.1106, -0.0850,
  // 1970–1979
   0.0401,  0.1431,  0.1898, -0.1466, -0.2647,  0.3720,
   0.2384, -0.0718,  0.0656,  0.1844,
  // 1980–1989
   0.3242, -0.0491,  0.2141,  0.2251,  0.0627,  0.3216,
   0.1847,  0.0523,  0.1681,  0.3149,
  // 1990–1999
  -0.0317,  0.3055,  0.0767,  0.0999,  0.0131,  0.3743,
   0.2307,  0.3336,  0.2834,  0.2089,
  // 2000–2009
  -0.0911, -0.1198, -0.2227,  0.2836,  0.1074,  0.0483,
   0.1561,  0.0548, -0.3722,  0.2668,
  // 2010–2019
   0.1506,  0.0211,  0.1589,  0.3215,  0.1352,  0.0138,
   0.1177,  0.2164, -0.0452,  0.3133,
  // 2020–2024
   0.1802,  0.2847, -0.1817,  0.2606,  0.2331,
]

// Historical mean and std for display purposes
export const SP500_HISTORICAL_MEAN = SP500_ANNUAL_RETURNS.reduce((a, b) => a + b, 0) / SP500_ANNUAL_RETURNS.length
export const SP500_HISTORICAL_STD  = Math.sqrt(
  SP500_ANNUAL_RETURNS.reduce((sum, r) => sum + Math.pow(r - SP500_HISTORICAL_MEAN, 2), 0)
  / SP500_ANNUAL_RETURNS.length
)
export const SP500_YEARS = { from: 1926, to: 2024, count: SP500_ANNUAL_RETURNS.length }
