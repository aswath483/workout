// Pure BMI / body-composition helpers, kg + cm throughout. These are rough,
// population-level estimates for framing a realistic goal — not medical advice.

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): 'underweight' | 'healthy' | 'overweight' | 'obese' {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'healthy';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// Weight range for a "healthy" BMI (18.5–24.9) at a given height.
export function healthyWeightRange(heightCm: number): [number, number] {
  const heightM = heightCm / 100;
  return [18.5 * heightM * heightM, 24.9 * heightM * heightM];
}

// Safe, sustainable fat-loss rate: 0.5–1% of bodyweight per week.
export function safeWeeklyLossRange(weightKg: number): [number, number] {
  return [weightKg * 0.005, weightKg * 0.01];
}

// Protein target for resistance training, 1.6–2.2 g per kg bodyweight —
// matters most for recomposition and muscle-gain goals.
export function proteinTargetRange(weightKg: number): [number, number] {
  return [weightKg * 1.6, weightKg * 2.2];
}
