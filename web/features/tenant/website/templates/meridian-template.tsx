import type { TemplateComponentProps } from "../types";
import { HospitalitySite } from "./hospitality-site";

export function MeridianTemplate(props: TemplateComponentProps) {
  return <HospitalitySite {...props} variant="meridian" />;
}
