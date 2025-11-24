"use client"
import React from 'react'

import {
    keepPreviousData,
    useQuery,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

import './eventTable.css'

import {
    PaginationState,
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
} from '@tanstack/react-table'

import { fetchData } from '@/lib/fetchEvents'
import {getFancyTime} from "@/lib/utils";


type Events = {
    groupId: number,
    title: string,
    address: string,
    startsAt: Date,
    endsAt: Date,
}

const queryClient = new QueryClient()

function EventTable() {

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'groupId',
                header: () => 'Group',
            },
            {
                accessorKey: 'title',
                header: () => 'Event',
            },
            {
                accessorKey: 'address',
                header: () => 'Where',

            },
            {
                id: "date",
                cell: ({ row }:{row: {original: Events}}) => {
                    const d = row.original.startsAt;
                    const dt = new Date(d);
                    const month = dt.getMonth() + 1;
                    return month + "/" + dt.getDate() + "/" + dt.getFullYear();
                },
                header: () => 'Date',
            },
            {
                id: "time",
                cell: ({ row }:{row: {original: Events}}) => {
                    const starts = getFancyTime(row.original.startsAt);
                    const ends = getFancyTime(row.original.endsAt);
                    return starts + ' - ' + ends;
                },
                header: () => 'Time',
            },
            // {
            //     accessorKey: 'startsAt',
            //     cell: (startTime: { getValue: () => string | number | Date }) => {
            //         const dt = new Date(startTime.getValue());
            //         const hour = (dt.getHours() + 24) % 12 || 12;
            //         const ampm = dt.getHours() >= 12 ? 'pm' : 'am';
            //         return hour + ":" + dt.getMinutes() + ampm;
            //     },
            //     header: () => 'Starts At',
            // },
            // {
            //     accessorKey: 'endsAt',
            //     cell: endTime => {
            //         const dt = new Date(endTime.getValue());
            //         const hour = (dt.getHours() + 24) % 12 || 12;
            //         const ampm = dt.getHours() >= 12 ? 'pm' : 'am';
            //         return hour + ":" + dt.getMinutes() + ampm;
            //     },
            //     header: () => 'Ends At',
            // },
        ],
        []
    )

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const dataQuery = useQuery({
        queryKey: ['data', pagination],
        queryFn: () => fetchData(pagination),
        placeholderData: keepPreviousData, // don't have 0 rows flash while changing pages/loading next page
    })

    const defaultData = React.useMemo(() => [], [])

    const table = useReactTable({
        data: dataQuery.data?.rows ?? defaultData,
        columns,
        pageCount: dataQuery.data?.pageCount ?? -1,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        debugTable: false,
    })

    return (
        <div className="p-2">
        <div className="h-2" />
            <table className="mx-auto max-w-[1000] w-full rounded-corners">
                <thead className="rounded-lg">
                    {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                        return (
                                            <th key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : (
                                                    <div>
                                                        {flexRender(
                                                                header.column.columnDef.header,
                                                            header.getContext()
                                                )}
                                            </div>
                                    )}
                                        </th>
                                    )
                                    })}
                                </tr>
                        ))}
            </thead>
            <tbody>
            {table.getRowModel().rows.map(row => {
                    return (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(
                                                    cell.column.columnDef.cell,
                                                cell.getContext()
                                    )}
                                    </td>
                                )
                                })}
                            </tr>
                    )
                })}
            </tbody>
            </table>
            <div className="h-2" />
    <div className="flex items-center gap-2 mx-auto justify-center">
    <button
        className="border rounded p-1"
    onClick={() => table.firstPage()}
    disabled={!table.getCanPreviousPage()}
>
    {'<<'}
    </button>
    <button
    className="border rounded p-1"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
>
    {'<'}
    </button>
    <button
    className="border rounded p-1"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
>
    {'>'}
    </button>
    <button
    className="border rounded p-1"
    onClick={() => table.lastPage()}
    disabled={!table.getCanNextPage()}
>
    {'>>'}
    </button>
    <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>
        {table.getState().pagination.pageIndex + 1} of{' '}
    {table.getPageCount().toLocaleString()}
    </strong>
    </span>
    <span className="flex items-center gap-1">
        | Go to page:
        <input
            type="number"
    min="1"
    max={table.getPageCount()}
    defaultValue={table.getState().pagination.pageIndex + 1}
    onChange={e => {
        const page = e.target.value ? Number(e.target.value) - 1 : 0
        table.setPageIndex(page)
    }}
    className="border p-1 rounded w-16"
        />
        </span>
        <select
    value={table.getState().pagination.pageSize}
    onChange={e => {
        table.setPageSize(Number(e.target.value))
    }}
>
    {[10, 20, 30, 40, 50].map(pageSize => (
        <option key={pageSize} value={pageSize}>
        Show {pageSize}
        </option>
    ))}
    </select>
    {dataQuery.isFetching ? 'Loading...' : null}
    </div>
</div>
)
}

export default function Table() {
    return (
        <QueryClientProvider client={queryClient}>
            <EventTable/>
        </QueryClientProvider>
    )
}