import type { Metadata } from "next"

import { CategoriesPageClient } from "@/features/tenant/category/components/categories-page-client"

export const metadata: Metadata = {
  title: "Categories · Atithi",
}

export default async function MenuCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <CategoriesPageClient id={id} />
}
