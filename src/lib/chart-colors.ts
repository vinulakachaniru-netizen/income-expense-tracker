export const CHART_COLORS = {
  teal: "#14b8a6", /* Neon Teal */
  tealDark: "#0f766e",
  tealLight: "#ccfbf1",
  saffron: "#f59e0b",
  saffronLight: "#fef3c7",
  saffronDark: "#b45309",
  emerald: "#10b981",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  violet: "#8b5cf6",
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Food: CHART_COLORS.teal,
  Transport: CHART_COLORS.saffron,
  Rent: CHART_COLORS.violet,
  Bills: CHART_COLORS.rose,
  Entertainment: CHART_COLORS.cyan,
};
