"use client";

import type React from "react";
import { useState, useRef, useMemo, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Badge } from "../ui/badge";

import { exportExcel, exportPDF } from "@/libs/export";

export interface Column<T> {
  key: string;
  label: string;
  width?: number;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

export interface DataTableAction<T> {
  icon: ReactNode;
  label: string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  actions?: DataTableAction<T>[];
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onAdd?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showAdd?: boolean;
  addButtonText?: string;
  keyExtractor: (item: T) => string | number;
  filterOptions?: FilterOption[];
}

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  actions = [],
  onSearch,
  onFilter,
  onAdd,
  searchPlaceholder = "Tìm kiếm...",
  showSearch = true,
  showFilter = true,
  showAdd = true,
  addButtonText = "Thêm mới",
  keyExtractor,
  filterOptions = [],
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columns.reduce(
      (acc, col) => ({
        ...acc,
        [col.key]: col.width || 150,
      }),
      {}
    )
  );
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          if (col.searchable === false) return false;
          const value = (item as any)[col.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter((item) => {
          const itemValue = String((item as any)[key]);
          return values.includes(itemValue);
        });
      }
    });

    return result;
  }, [data, searchQuery, activeFilters, columns]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValues };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(activeFilters).reduce(
    (acc, vals) => acc + vals.length,
    0
  );

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[columnKey];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(100, startWidthRef.current + diff);
      setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Card className="border border-slate-200 shadow-xl bg-white rounded-3xl overflow-hidden">
      <CardHeader className="pb-6 pt-7 px-7 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 mb-1.5">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-slate-500 font-medium">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Ô tìm kiếm */}
            {showSearch && (
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-11 h-11 rounded-xl bg-white border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all"
                />
              </div>
            )}

            {/* Nút xuất Excel */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportExcel(columns, filteredData, title, description)
              }
              className="h-11 px-5 rounded-xl border-slate-200 hover:bg-green-50 hover:border-green-300 bg-white shadow-sm transition-all flex items-center gap-2"
            >
              📗
              <span>Xuất Excel</span>
            </Button>

            {/* Nút xuất PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportPDF(columns, filteredData, title, description)
              }
              className="h-11 px-5 rounded-xl border-slate-200 hover:bg-red-50 hover:border-red-300 bg-white shadow-sm transition-all flex items-center gap-2"
            >
              📕
              <span>Xuất PDF</span>
            </Button>

            {/* Nút lọc */}
            {showFilter && filterOptions.length > 0 && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-white shadow-sm transition-all relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Lọc dữ liệu
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
  <SheetHeader>
    <SheetTitle>Bộ lọc dữ liệu</SheetTitle>
    <SheetDescription>
      Chọn điều kiện lọc phù hợp để thu hẹp kết quả hiển thị.
    </SheetDescription>
  </SheetHeader>

  {/* ✅ phần nội dung filterOptions (các lựa chọn lọc) */}
  <div className="mt-6 space-y-4">
    {filterOptions.map((filter) => (
      <div key={filter.key} className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{filter.label}</p>
        <div className="flex flex-wrap gap-2">
          {filter.options.map((opt) => {
            const isActive = activeFilters[filter.key]?.includes(opt.value);
            return (
              <Button
                key={opt.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter.key, opt.value)}
                className={`rounded-full px-3 ${
                  isActive
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>
    ))}

    {activeFilterCount > 0 && (
      <div className="pt-4">
        <Button
          onClick={clearFilters}
          variant="outline"
          size="sm"
          className="rounded-lg border-slate-300 hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      </div>
    )}
  </div>
</SheetContent>

              </Sheet>
            )}

            {/* Nút thêm mới */}
            {showAdd && (
              <Button
                size="sm"
                onClick={onAdd}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 via-slate-100/80 to-slate-50 hover:from-slate-100 hover:via-slate-100 hover:to-slate-100 border-b-2 border-slate-200 transition-all duration-200">
                {columns.map((column, index) => (
                  <TableHead
                    key={column.key}
                    className={`font-bold text-slate-700 text-xs uppercase tracking-wider h-16 relative group ${
                      index === 0 ? "pl-7" : ""
                    } ${
                      index === columns.length - 1 && actions.length > 0
                        ? "pr-7 text-right"
                        : ""
                    }`}
                    style={{ width: columnWidths[column.key] }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative">
                        {column.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:w-full transition-all duration-300" />
                      </span>
                    </div>
                    {index < columns.length - 1 && (
                      <div
                        className={`absolute right-0 top-4 h-8 w-1 cursor-col-resize transition-all rounded-full ${
                          resizingColumn === column.key
                            ? "bg-blue-500 shadow-lg scale-110"
                            : "bg-slate-300 hover:bg-blue-400 opacity-0 group-hover:opacity-100"
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, column.key)}
                      />
                    )}
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="font-bold text-slate-700 text-xs uppercase text-center tracking-wider h-16 w-[150px]">
                    Thao tác
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="h-12 w-12 mb-2 opacity-50" />
                      <p className="font-medium">Không tìm thấy dữ liệu</p>
                      <p className="text-sm">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={keyExtractor(item)}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-blue-50/30 hover:to-transparent transition-all duration-200 border-b border-slate-100 hover:border-blue-200 hover:shadow-[0_2px_8px_rgba(59,130,246,0.08)] group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={column.key}
                        className={`py-5 text-slate-700 ${
                          colIndex === 0 ? "pl-7 font-semibold" : ""
                        }`}
                        style={{ width: columnWidths[column.key] }}
                      >
                        {column.render
                          ? column.render(item)
                          : String((item as any)[column.key])}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="py-5 w-[150px]">
                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="ghost"
                              size="icon"
                              onClick={() => action.onClick(item)}
                              className={`h-9 w-9 rounded-lg transition-all duration-200 hover:scale-110 ${
                                action.variant === "destructive"
                                  ? "hover:bg-red-50 hover:text-red-600 hover:shadow-lg hover:shadow-red-100"
                                  : "hover:bg-blue-50 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-100"
                              }`}
                              title={action.label}
                            >
                              {action.icon}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-7 py-5 border-t border-slate-200 bg-gradient-to-br from-slate-50/50 to-white">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">Hiển thị</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-9 rounded-lg border-slate-200 bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {startIndex + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(endIndex, filteredData.length)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-slate-800">
                {filteredData.length}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-lg border-slate-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-lg border-slate-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg"
                        : "border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-lg border-slate-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-lg border-slate-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
