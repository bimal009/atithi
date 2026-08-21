import {
  BedDoubleIcon,
  BedIcon,
  CalendarCheckIcon,
  ChefHatIcon,
  ClipboardListIcon,
  LayersIcon,
  type LucideIcon,
  ReceiptIcon,
  ShieldIcon,
  SquareMenuIcon,
  TableIcon,
  TagIcon,
  TentIcon,
  UserPlusIcon,
  UsersRoundIcon,
  UtensilsIcon,
} from "lucide-react";

type NotificationMeta = {
  icon: LucideIcon;
  className: string;
};

const META: Record<string, NotificationMeta> = {
  reservation: { icon: CalendarCheckIcon, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  order: { icon: ChefHatIcon, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  room: { icon: BedIcon, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  roomtype: { icon: BedDoubleIcon, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  cabin: { icon: TentIcon, className: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  table: { icon: TableIcon, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  section: { icon: TableIcon, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  category: { icon: LayersIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  submenu: { icon: SquareMenuIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  menuset: { icon: ClipboardListIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  menuitem: { icon: UtensilsIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  addon: { icon: TagIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  billingtype: { icon: ReceiptIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  role: { icon: ShieldIcon, className: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  member: { icon: UsersRoundIcon, className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  customer: { icon: UserPlusIcon, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
};

const DEFAULT_META: NotificationMeta = {
  icon: ClipboardListIcon,
  className: "bg-primary/10 text-primary",
};

export function getNotificationMeta(type: string): NotificationMeta {
  const category = type.split(".")[0] ?? "";
  return META[category] ?? DEFAULT_META;
}
