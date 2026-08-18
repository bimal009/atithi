import type { FoodType } from "@/types";

export const FOOD_TYPE_LABEL: Record<FoodType, string> = {
  veg: "Veg",
  "non-veg": "Non-veg",
  vegan: "Vegan",
  egg: "Eggetarian",
};

export const FOOD_TYPE_DOT_CLASS: Record<FoodType, string> = {
  veg: "border-primary bg-primary/40",
  "non-veg": "border-destructive bg-destructive/40",
  vegan: "border-emerald-600 bg-emerald-600/40 dark:border-emerald-500 dark:bg-emerald-500/40",
  egg: "border-amber-600 bg-amber-600/40 dark:border-amber-500 dark:bg-amber-500/40",
};

export const FOOD_TYPE_OPTIONS: { value: FoodType; label: string }[] = (
  Object.keys(FOOD_TYPE_LABEL) as FoodType[]
).map((value) => ({ value, label: FOOD_TYPE_LABEL[value] }));
