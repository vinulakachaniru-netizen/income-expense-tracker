const lkrFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatLKR(amount: number, prefix: "Rs." | "LKR" = "Rs."): string {
  return `${prefix} ${lkrFormatter.format(Math.abs(amount))}`;
}
