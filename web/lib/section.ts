import type { Section } from "@/features/tenant/section/types";

export function sectionName(sections: Section[], id?: string | null): string {
  if (!id) return "—";
  return sections.find((s) => s.id === id)?.name ?? "—";
}
