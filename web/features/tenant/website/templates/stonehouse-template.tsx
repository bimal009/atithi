import type { TemplateComponentProps } from "../types";
import { HospitalitySite } from "./hospitality-site";

export function StonehouseTemplate(props: TemplateComponentProps) {
  return <HospitalitySite {...props} variant="stonehouse" />;
}
