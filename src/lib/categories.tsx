import {
  Car,
  Gamepad2,
  Home,
  Receipt,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types/transaction";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Food: UtensilsCrossed,
  Transport: Car,
  Rent: Home,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Income: Wallet,
};

export function getCategoryIcon(category: Category): LucideIcon {
  return CATEGORY_ICONS[category];
}
