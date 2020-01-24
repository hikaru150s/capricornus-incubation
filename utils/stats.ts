export function sum(values: Array<number>): number {
  return values.reduce((p, c) => p + c, 0);
}

export function avg(values: Array<number>): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

export function satisfaction(constraintValue: number, allConstraintValue: Array<number>): number {
  return Math.pow(constraintValue - avg(allConstraintValue), 2);
}

export function stdDev(values: Array<number>): number {
  return values.length === 0 ? 0 : Math.sqrt(sum(values) / values.length);
}

export function cohort(value: number): number {
  return 1 / (value + 1);
}
