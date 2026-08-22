import type { Metadata } from "next"

import { CategoriesPageClient } from "@/features/tenant/category/components/categories-page-client"

export const metadata: Metadata = {
  title: "Categories · Atithi",
}

export default async function MenuCategoriesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <CategoriesPageClient tenant={tenant} />
}
