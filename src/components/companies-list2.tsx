"use client";

import {
  Column,
  type ColumnDef,
  type ColumnFiltersState,
  ColumnPinningState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FaEyeSlash } from "react-icons/fa";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Company {
  name: string;
  logo: string;
  email: string;
  url: string;
  typeOfPartner: string;
  tier: string;
  mainContact: string;
  employees: number;
  revenue: string;
  industry: string;
}

const defaultCompanies: Company[] = [
  {
    name: "Figma",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/figma-icon.svg",
    email: "partners@figma.com",
    url: "https://figma.com",
    typeOfPartner: "Technology",
    tier: "Platinum",
    mainContact: "Sarah Chen",
    employees: 1200,
    revenue: "$500M+",
    industry: "Design Tools",
  },
  {
    name: "Vercel",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-icon.svg",
    email: "partners@vercel.com",
    url: "https://vercel.com",
    typeOfPartner: "Integration",
    tier: "Gold",
    mainContact: "Mike Johnson",
    employees: 450,
    revenue: "$100M+",
    industry: "Cloud Infrastructure",
  },
  {
    name: "Supabase",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase.svg",
    email: "partners@supabase.com",
    url: "https://supabase.com",
    typeOfPartner: "Technology",
    tier: "Silver",
    mainContact: "Emily Davis",
    employees: 180,
    revenue: "$50M+",
    industry: "Database",
  },
  {
    name: "GitHub",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/github-icon.svg",
    email: "partners@github.com",
    url: "https://github.com",
    typeOfPartner: "Strategic",
    tier: "Platinum",
    mainContact: "James Wilson",
    employees: 3000,
    revenue: "$1B+",
    industry: "Developer Tools",
  },
  {
    name: "Notion",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/notion-icon.svg",
    email: "partners@notion.so",
    url: "https://notion.so",
    typeOfPartner: "Reseller",
    tier: "Gold",
    mainContact: "Lisa Park",
    employees: 500,
    revenue: "$250M+",
    industry: "Productivity",
  },
];

interface HeaderWithSortingProps {
  column: Column<Company>;
  label: string;
}

const HeaderWithSorting = ({ column, label }: HeaderWithSortingProps) => {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="w-full justify-between !px-0"
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp />
      ) : sorted === "desc" ? (
        <ArrowDown />
      ) : (
        <ArrowUpDown />
      )}
    </Button>
  );
};

interface FilterCheckboxListProps {
  options: string[];
  selectedValues: string[];
  header: string;
  onFilterChange: (updatedValues: string[] | undefined) => void;
  labels?: Record<string, string>;
}

const FilterCheckboxList = ({
  options,
  selectedValues,
  header,
  onFilterChange,
  labels,
}: FilterCheckboxListProps) => {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div
          key={option}
          className="flex max-w-32 items-center gap-2 sm:max-w-full"
        >
          <Checkbox
            id={`${header}-${option}`}
            checked={selectedValues.includes(option)}
            onCheckedChange={(checked) => {
              const updated = checked
                ? [...selectedValues, option]
                : selectedValues.filter((v) => v !== option);
              onFilterChange(updated.length ? updated : undefined);
            }}
          />
          <Label htmlFor={`${header}-${option}`}>
            {labels?.[option] ?? option}
          </Label>
        </div>
      ))}
    </div>
  );
};

const stringIncludesFilter: FilterFn<Company> = (
  row,
  columnId,
  filterValue,
) => {
  const value = row.getValue<string>(columnId);
  const filterArray = filterValue as string[];
  if (!filterArray || filterArray.length === 0) return true;
  return filterArray.includes(value);
};

const columns: ColumnDef<Company>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <HeaderWithSorting column={column} label="Company" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <img
          src={row.original.logo}
          alt={row.original.name}
          className="size-4 rounded-md object-contain dark:invert"
        />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <a href={`mailto:${row.original.email}`} className="text-sm underline">
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: "url",
    header: ({ column }) => <HeaderWithSorting column={column} label="URL" />,
    cell: ({ row }) => (
      <a
        href={row.original.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline"
      >
        {row.original.url}
      </a>
    ),
  },
  {
    accessorKey: "typeOfPartner",
    header: "Type of Partner",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.typeOfPartner}</Badge>
    ),
  },
  {
    accessorKey: "tier",
    header: ({ column }) => <HeaderWithSorting column={column} label="Tier" />,
    cell: ({ row }) => {
      const tier = row.original.tier;
      const variant =
        tier === "Platinum"
          ? "default"
          : tier === "Gold"
            ? "secondary"
            : "outline";
      return <Badge variant={variant}>{tier}</Badge>;
    },
  },
  {
    accessorKey: "mainContact",
    header: "Main Contact",
  },
  {
    accessorKey: "employees",
    header: ({ column }) => (
      <HeaderWithSorting column={column} label="Employees" />
    ),
    cell: ({ row }) => <span>{row.original.employees.toLocaleString()}</span>,
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <Badge variant="outline">{row.original.revenue}</Badge>,
  },
  {
    accessorKey: "industry",
    header: "Industry",
    filterFn: stringIncludesFilter,
  },
];

interface CompaniesList2Props {
  className?: string;
  title?: string;
  data?: Company[];
}

const CompaniesList2 = ({
  className,
  title = "All Companies",
  data = defaultCompanies,
}: CompaniesList2Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["select"],
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const uniqueIndustries = useMemo(() => {
    const industries = new Set<string>();
    data.forEach((company) => {
      industries.add(company.industry);
    });
    return Array.from(industries).sort();
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnPinning,
      columnVisibility,
      globalFilter,
      sorting,
      rowSelection,
    },
  });

  const industryFilter =
    (table.getColumn("industry")?.getFilterValue() as string[]) ?? [];

  const columnOptions = table
    .getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => column.id);
  const selectedColumnOptions = table
    .getAllColumns()
    .filter((column) => column.getCanHide() && column.getIsVisible())
    .map((column) => column.id);

  return (
    <section className={cn("py-32", className)}>
      <div className="container space-y-8">
        <h3 className="text-2xl font-bold">{title}</h3>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline">
                <Plus /> Add companies
              </Button>
              <Button variant="outline">
                <Mail /> Email all
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {sorting.length > 0 && (
                <Button variant="ghost" onClick={() => setSorting([])}>
                  <X />
                  Remove Sorting
                </Button>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2" size="icon">
                    <FaEyeSlash />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Toggle Columns
                    </Label>
                    <FilterCheckboxList
                      options={columnOptions}
                      selectedValues={selectedColumnOptions}
                      header="columns"
                      onFilterChange={(values) => {
                        const hideableColumns = table
                          .getAllColumns()
                          .filter((column) => column.getCanHide());
                        hideableColumns.forEach((column) => {
                          column.toggleVisibility(
                            values?.includes(column.id) ?? false,
                          );
                        });
                      }}
                      labels={{
                        name: "Company",
                        email: "Email",
                        url: "URL",
                        typeOfPartner: "Type of Partner",
                        tier: "Tier",
                        mainContact: "Main Contact",
                        employees: "Employees",
                        revenue: "Revenue",
                        industry: "Industry",
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2" size="icon">
                    <SlidersHorizontal className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Industry</Label>
                    <FilterCheckboxList
                      options={uniqueIndustries}
                      selectedValues={industryFilter}
                      header="industry"
                      onFilterChange={(values) =>
                        table.getColumn("industry")?.setFilterValue(values)
                      }
                    />
                  </div>
                  {industryFilter.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setColumnFilters([])}
                    >
                      Clear all filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                placeholder="Search"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full md:w-56"
              />
            </div>
          </div>

          <div className="overflow-hidden border-y">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "border-r last:border-r-0",
                          header.column.getIsPinned() &&
                            "sticky left-0 z-10 bg-background !px-2",
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "border-r last:border-r-0",
                            cell.column.getIsPinned() &&
                              "sticky left-0 z-10 bg-background",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 px-5">
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export { CompaniesList2 };
