"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  type LucideIcon,
  SearchIcon,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export interface DataTableColumn<T> {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  headerClassName?: string
  cellClassName?: string
}

/**
 * One shared table shell for every entity list in the dashboard — same card,
 * search box, pagination footer, loading and empty states. Columns and data
 * are passed as props so each page only describes its own data.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading,
  loadingRows = 6,
  emptyIcon,
  emptyTitle = "No results",
  emptyDescription,
  searchPlaceholder,
  searchFn,
  toolbar,
  pageSize = 8,
}: {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  loading?: boolean
  loadingRows?: number
  emptyIcon: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  searchPlaceholder?: string
  searchFn?: (row: T, query: string) => boolean
  toolbar?: React.ReactNode
  pageSize?: number
}) {
  const [query, setQuery] = React.useState("")
  const [pageIndex, setPageIndex] = React.useState(0)

  // Reset to page 1 whenever the search text changes — adjusted during
  // render (React's documented pattern) rather than in an effect, so it
  // takes effect before paint instead of causing an extra render pass.
  const [resetKey, setResetKey] = React.useState(query)
  if (resetKey !== query) {
    setResetKey(query)
    setPageIndex(0)
  }

  const filtered = React.useMemo(() => {
    if (!searchFn || !query.trim()) return data
    return data.filter((row) => searchFn(row, query.trim().toLowerCase()))
  }, [data, query, searchFn])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const page = filtered.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  )

  return (
    <div className="flex flex-col gap-3">
      {(searchFn || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchFn && (
            <div className="relative flex-1 sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder ?? "Search…"}
                className="pl-8"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <Card className="gap-0 py-0">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: loadingRows }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <CardContent className="py-2">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
            />
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.headerClassName}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {page.map((row) => (
                  <TableRow key={getRowId(row)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.cellClassName}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-4 border-t px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Page {safePageIndex + 1} of {pageCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={safePageIndex === 0}
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={safePageIndex >= pageCount - 1}
                    onClick={() =>
                      setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                    }
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
