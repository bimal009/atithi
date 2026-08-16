"use client"

import * as React from "react"

interface PageTitleContextValue {
  title: string
  setTitle: (title: string) => void
}

const PageTitleContext = React.createContext<PageTitleContextValue | null>(null)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState("Overview")

  const value = React.useMemo(() => ({ title, setTitle }), [title])

  return (
    <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
  )
}

export function usePageTitle(title: string) {
  const ctx = React.useContext(PageTitleContext)
  if (!ctx) {
    throw new Error("usePageTitle must be used within a PageTitleProvider")
  }
  React.useEffect(() => {
    ctx.setTitle(title)
  }, [title, ctx])
}

export function useSiteTitle() {
  const ctx = React.useContext(PageTitleContext)
  if (!ctx) {
    throw new Error("useSiteTitle must be used within a PageTitleProvider")
  }
  return ctx.title
}
