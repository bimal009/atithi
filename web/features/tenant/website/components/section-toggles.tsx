import { Switch } from "@/components/ui/switch";

import { isSectionEnabled, SECTION_KEYS, SECTION_LABELS, type SiteContent } from "../types";

export function SectionToggles({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (patch: Partial<SiteContent>) => void;
}) {
  function toggle(key: (typeof SECTION_KEYS)[number], value: boolean) {
    onChange({ enabledSections: { ...content.enabledSections, [key]: value } });
  }

  return (
    <div className="flex flex-col gap-3">
      {SECTION_KEYS.map((key) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <span className="text-sm">{SECTION_LABELS[key]}</span>
          <Switch
            checked={isSectionEnabled(content, key)}
            onCheckedChange={(checked) => toggle(key, checked)}
          />
        </div>
      ))}
    </div>
  );
}
