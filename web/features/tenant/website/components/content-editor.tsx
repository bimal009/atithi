import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { SiteContent } from "../types";

export function ContentEditor({
  value,
  onChange,
}: {
  value: SiteContent;
  onChange: (patch: Partial<SiteContent>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="site-hero-heading">Hero heading</FieldLabel>
        <Input
          id="site-hero-heading"
          value={value.heroHeading}
          onChange={(e) => onChange({ heroHeading: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="site-hero-subheading">Hero subheading</FieldLabel>
        <Input
          id="site-hero-subheading"
          value={value.heroSubheading}
          onChange={(e) => onChange({ heroSubheading: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="site-cta-label">Call-to-action label</FieldLabel>
        <Input
          id="site-cta-label"
          value={value.ctaLabel}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="site-about-heading">About heading</FieldLabel>
        <Input
          id="site-about-heading"
          value={value.aboutHeading}
          onChange={(e) => onChange({ aboutHeading: e.target.value })}
        />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="site-about-body">About text</FieldLabel>
        <Textarea
          id="site-about-body"
          rows={3}
          value={value.aboutBody}
          onChange={(e) => onChange({ aboutBody: e.target.value })}
        />
      </Field>
    </div>
  );
}
