import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import './AdvancedTable.css'; // We will create this file next
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

function AdvancedTable({ data, handleDelete }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      {
        header: 'Match Details',
        accessorKey: 'map_name',
        cell: (info) => (
          <div>
            <div style={{ fontWeight: '600' }}>{info.getValue()}</div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
              {info.row.original.match_date}
            </div>
          </div>
        ),
      },
      {
        header: 'Team Rank',
        accessorKey: 'team_rank',
        cell: (info) => `#${info.getValue()}`,
      },
      {
  header: 'Player Performances',
  accessorKey: 'performances',
  enableSorting: false,
  cell: (info) => (
    <div>
      {info.getValue().map((p) => (
        // --- THIS IS THE FIX ---
        // Use the unique p.id from the database instead of p.player_ign
        <div key={p.id} style={{ fontSize: '0.9rem' }}>
          <strong>{p.player_ign}:</strong> {p.kills} Kills, {p.damage} Dmg
        </div>
      ))}
    </div>
  ),
},
      {
        header: 'Actions',
        id: 'actions',
        cell: (info) => (
          <div className="action-buttons">
            <Link to={`/dashboard/history/${info.row.original.id}`} className="action-btn">
              View Details
            </Link>
            <button onClick={() => handleDelete(info.row.original.id)} className="delete-btn">
              🗑️
            </button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="advanced-table-container">
      <div className="table-controls">
        <div className="entries-per-page">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="search-input">
          <label>Search: </label>
          <input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
          />
        </div>
      </div>

      <table className="advanced-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: <FaSortUp />,
                    desc: <FaSortDown />,
                  }[header.column.getIsSorted()] ?? <FaSort />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </strong>
        </span>
        <div className="pagination-buttons">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            {'<<'}
          </button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {'<'}
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {'>'}
          </button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedTable;