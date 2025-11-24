"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type HistoricalEvent = {
    group: string;
    title: string;
    address: string;
    date: string;      // ISO or display string—match your API
    attendees: number;
};

export const columns: ColumnDef<HistoricalEvent>[] = [
    {
        accessorKey: "groupId",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Group
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("groupId")}</div>,
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => <div>{row.getValue("address")}</div>,
    },
    {
        accessorKey: "startsAt",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("startsAt") as string}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const event = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(event.title)}
                        >
                            Copy event title
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function HistoricalEventsTable() {
    // ---- table state (drives the API) ----
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 5 });

    // ---- server data & meta ----
    const [data, setData] = React.useState<HistoricalEvent[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Optional: debounce filters to avoid spamming API on every keystroke
    const debouncedFilters = useDebounce(columnFilters, 250);

    // ---- fetch from API when state changes ----
    React.useEffect(() => {
        const controller = new AbortController();
        const { pageIndex, pageSize } = pagination;

        // Build sort param: e.g. "date:asc,title:desc"
        const sort = sorting
            .map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`)
            .join(",");

        // Filters go as JSON; server can parse them
        const filters = JSON.stringify(debouncedFilters);

        const params = new URLSearchParams({
            page: String(pageIndex),
            pageSize: String(pageSize),
            when: 'past'
        });
        if (sort) params.set("sort", sort);
        if (filters !== "[]") params.set("filters", filters);

        async function run() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/admin/events?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: { rows: HistoricalEvent[]; rowCount: number; pageCount : number; pageSize: number; } = await res.json();
                setData(json.rows);
                setTotal(json.rowCount);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    setError(err.message ?? "Failed to load");
                }
            } finally {
                setLoading(false);
            }
        }

        run();
        return () => controller.abort();
    }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedFilters]);

    // Total pages for TanStack manual pagination
    const pageCount =
        pagination.pageSize > 0 ? Math.ceil(total / pagination.pageSize) : -1;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(), // no client sorting/filtering/pagination
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,

        // ---- manual modes: server drives these ----
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
        pageCount,
    });

    const canPrev = pagination.pageIndex > 0;
    const canNext = pageCount === -1 ? true : pagination.pageIndex < pageCount - 1;

    return (
        <div className="w-full p-6">
            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="Filter titles..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((c) => c.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : header.column.columnDef.header &&
                                            (typeof header.column.columnDef.header === "function"
                                                ? header.column.columnDef.header(header.getContext() as any)
                                                : header.column.columnDef.header)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading…
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : data.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {cell.column.columnDef.cell
                                                ? (cell.column.columnDef.cell as any)(cell.getContext())
                                                : String(cell.getValue())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of {total} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!canPrev}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!canNext}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** Small debounce hook to reduce fetches while typing filters */
function useDebounce<T>(value: T, delay = 250): T {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}
