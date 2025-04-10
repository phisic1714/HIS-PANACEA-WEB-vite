export default function CalculatorMap({ bpSystolic = null, bpDiastolic = null }) {
  if (!bpSystolic || !bpDiastolic) return null
  const BP = Number(bpSystolic);
  const DP = bpDiastolic ? Number(bpDiastolic) : 1;
  const map = Number(DP + 1 / 3 * (BP - DP)).toFixed(2);
  return String(map) === "NaN" ? null : String(map)
}
