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
  searchValue,
  onSearchChange,
  toolbar,
  pageSize = 8,
  page: serverPage,
  pageCount: serverPageCount,
  onPageChange,
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
  searchValue?: string
  onSearchChange?: (value: string) => void
  toolbar?: React.ReactNode
  pageSize?: number
  /** 1-indexed current page. Pass alongside onPageChange to paginate server-side. */
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
}) {
  const controlled = onSearchChange !== undefined
  const [internalQuery, setInternalQuery] = React.useState("")
  const query = controlled ? (searchValue ?? "") : internalQuery
  const setQuery = onSearchChange ?? setInternalQuery
  const showSearch = controlled || !!searchFn

  const serverPaginated = onPageChange !== undefined

  const [pageIndex, setPageIndex] = React.useState(0)

  const [resetKey, setResetKey] = React.useState(query)
  if (resetKey !== query) {
    setResetKey(query)
    if (!serverPaginated) setPageIndex(0)
  }

  const filtered = React.useMemo(() => {
    if (controlled || serverPaginated) return data
    if (!searchFn || !query.trim()) return data
    return data.filter((row) => searchFn(row, query.trim().toLowerCase()))
  }, [controlled, serverPaginated, data, query, searchFn])

  const pageCount = serverPaginated
    ? Math.max(1, serverPageCount ?? 1)
    : Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePageIndex = serverPaginated
    ? Math.max(0, (serverPage ?? 1) - 1)
    : Math.min(pageIndex, pageCount - 1)
  const page = serverPaginated
    ? filtered
    : filtered.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize)

  const goToPage = (nextIndex: number) => {
    if (serverPaginated) {
      onPageChange(nextIndex + 1)
    } else {
      setPageIndex(nextIndex)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {(showSearch || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {showSearch && (
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
                    onClick={() => goToPage(Math.max(0, safePageIndex - 1))}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={safePageIndex >= pageCount - 1}
                    onClick={() => goToPage(Math.min(pageCount - 1, safePageIndex + 1))}
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
