export const CHART_COLORS = {
  teal: "#006D77",
  tealDark: "#005A63",
  tealLight: "#83C5BE",
  saffron: "#E8A838",
  saffronLight: "#F4C86B",
  saffronDark: "#C98B1E",
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Food: CHART_COLORS.teal,
  Transport: CHART_COLORS.saffron,
  Rent: CHART_COLORS.tealDark,
  Bills: CHART_COLORS.saffronLight,
  Entertainment: CHART_COLORS.tealLight,
};
