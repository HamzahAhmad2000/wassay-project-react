import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react"

const TableContext = React.createContext({})

const useTableContext = () => {
  const context = React.useContext(TableContext)
  if (!context) {
    throw new Error("Table components must be used within a TableProvider")
  }
  return context
}

const Table = React.forwardRef(({ className, data, columns, ...props }, ref) => {
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' })
  const [filterConfig, setFilterConfig] = React.useState({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilter = (key, value) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilterConfig({})
    setCurrentPage(1)
  }

  const filteredData = React.useMemo(() => {
    let filtered = [...data]
    
    Object.entries(filterConfig).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => 
          String(item[key]).toLowerCase().includes(String(value).toLowerCase())
        )
      }
    })
    
    return filtered
  }, [data, filterConfig])

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const contextValue = {
    data: paginatedData,
    columns,
    sortConfig,
    filterConfig,
    currentPage,
    pageSize,
    totalPages,
    totalItems: sortedData.length,
    handleSort,
    handleFilter,
    clearFilters,
    setCurrentPage,
    setPageSize
  }

  return (
    <TableContext.Provider value={contextValue}>
      <div className={cn("w-full", className)} ref={ref} {...props} />
    </TableContext.Provider>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div className={cn("w-full overflow-x-auto table-scrollbar", className)} ref={ref} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <table className={cn("w-full caption-bottom text-sm", className)} ref={ref} {...props} />
))
TableBody.displayName = "TableBody"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <thead className={cn("[&_tr]:border-b", className)} ref={ref} {...props} />
))
TableHead.displayName = "TableHead"

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-[var(--color-primary-100)] data-[state=selected]:bg-[var(--color-primary-100)]",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      "text-[var(--color-secondary-900)]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableHeaderCell = React.forwardRef(({ className, sortable, filterable, columnKey, children, ...props }, ref) => {
  const { handleSort, sortConfig, handleFilter, filterConfig } = useTableContext()

  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        "text-[var(--color-secondary-900)] bg-[var(--color-primary-100)]",
        sortable && "cursor-pointer select-none hover:bg-[var(--color-primary-200)]",
        className
      )}
      onClick={() => sortable && handleSort(columnKey)}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <ChevronUp 
              className={cn(
                "h-3 w-3",
                sortConfig.key === columnKey && sortConfig.direction === 'asc' 
                  ? "text-[var(--color-tertiary-500)]" 
                  : "text-gray-400"
              )} 
            />
            <ChevronDown 
              className={cn(
                "h-3 w-3 -mt-1",
                sortConfig.key === columnKey && sortConfig.direction === 'desc' 
                  ? "text-[var(--color-tertiary-500)]" 
                  : "text-gray-400"
              )} 
            />
          </div>
        )}
      </div>
      {filterable && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Filter..."
            value={filterConfig[columnKey] || ''}
            onChange={(e) => handleFilter(columnKey, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full px-2 py-1 text-xs border rounded",
              "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]",
              "text-[var(--color-secondary-900)] placeholder-[var(--color-secondary-800)]",
              "focus:outline-none focus:ring-1 focus:ring-[var(--color-tertiary-500)]"
            )}
          />
        </div>
      )}
    </th>
  )
})
TableHeaderCell.displayName = "TableHeaderCell"

const TablePagination = React.forwardRef(({ className, ...props }, ref) => {
  const { currentPage, totalPages, pageSize, totalItems, setCurrentPage, setPageSize } = useTableContext()

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center justify-between px-2 py-4",
        "text-[var(--color-secondary-900)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm">
          Showing {startItem}-{endItem} of {totalItems} items
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}
          className={cn(
            "px-2 py-1 text-sm border rounded",
            "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]",
            "text-[var(--color-secondary-900)]"
          )}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={cn(
            "p-2 rounded border",
            "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]",
            "text-[var(--color-secondary-900)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:bg-[var(--color-primary-100)]"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={cn(
            "p-2 rounded border",
            "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]",
            "text-[var(--color-secondary-900)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "hover:bg-[var(--color-primary-100)]"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
TablePagination.displayName = "TablePagination"

const TableFilter = React.forwardRef(({ className, onClear, ...props }, ref) => {
  const { clearFilters, filterConfig } = useTableContext()
  const hasActiveFilters = Object.values(filterConfig).some(value => value)

  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center justify-between px-2 py-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-[var(--color-secondary-800)]" />
        <input
          type="text"
          placeholder="Search all columns..."
          className={cn(
            "px-3 py-1 text-sm border rounded",
            "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]",
            "text-[var(--color-secondary-900)] placeholder-[var(--color-secondary-800)]",
            "focus:outline-none focus:ring-1 focus:ring-[var(--color-tertiary-500)]"
          )}
        />
      </div>
      
      {hasActiveFilters && (
        <button
          onClick={() => {
            clearFilters()
            onClear?.()
          }}
          className={cn(
            "px-3 py-1 text-sm rounded",
            "bg-[var(--color-tertiary-500)] text-white",
            "hover:bg-[var(--color-tertiary-600)]"
          )}
        >
          Clear Filters
        </button>
      )}
    </div>
  )
})
TableFilter.displayName = "TableFilter"

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeaderCell,
  TablePagination,
  TableFilter,
  useTableContext
}