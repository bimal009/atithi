import type { PricingUnit } from "@/types";

export const PRICING_UNIT_OPTIONS: { value: PricingUnit; label: string }[] = [
  { value: "night", label: "Per night" },
  { value: "hour", label: "Per hour" },
  { value: "daycation", label: "Daycation (time window)" },
  { value: "package", label: "Package" },
];

export const PRICING_LABEL_PLACEHOLDER: Record<PricingUnit, string | undefined> = {
  night: undefined,
  hour: undefined,
  daycation: "10 AM – 6 PM",
  package: "Full-day package",
};

export function formatPricingUnit(unit: PricingUnit, label?: string | null): string {
  switch (unit) {
    case "night":
      return "per night";
    case "hour":
      return "per hour";
    case "daycation":
      return label ? `Daycation · ${label}` : "Daycation";
    case "package":
      return label ? `Package · ${label}` : "Package";
  }
}
