/* log(erfc(x)) for x ≥ 0, from Numerical Recipes' Chebyshev fit (relative error below 1.2 × 10⁻⁷), kept
   as a logarithm so that it never underflows. */
function logErfc(x: number): number {
  const t = 1 / (1 + 0.5 * x);
  return (
    Math.log(t) -
    x * x -
    1.26551223 +
    t *
      (1.00002368 +
        t *
          (0.37409196 +
            t *
              (0.09678418 +
                t *
                  (-0.18628806 +
                    t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))
  );
}

export function logNormalCdf(z: number): number {
  if (z < 0) {
    return Math.log(0.5) + logErfc(-z / Math.SQRT2);
  }
  return Math.log1p(-0.5 * Math.exp(logErfc(z / Math.SQRT2)));
}

export function normalCdf(z: number): number {
  return Math.exp(logNormalCdf(z));
}
