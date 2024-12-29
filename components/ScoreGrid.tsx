'use client';
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PlayerScore } from "@/app/hooks/usePlayersAndScores"
import { Cup } from '@/app/lib/types'

interface ScoreGridProps {
  playerScores: PlayerScore[];
  cups: Cup[];
}

const getMedalEmoji = (place: number) => {
  switch (place) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return "";
  }
};

export function ScoreGrid({ playerScores, cups }: ScoreGridProps) {
  const rounds = playerScores.length > 0
    ? Math.max(...playerScores.flatMap(p => Object.keys(p.scores).map(Number)))
    : 0

  const getTopThreeScores = (roundScores: number[]): number[] => {
    const sortedScores = [...new Set(roundScores)].sort((a, b) => b - a);
    return sortedScores.slice(0, 3);
  };

  const columns: ColumnDef<PlayerScore>[] = [
    {
      id: "medal",
      header: () => null,
      cell: ({ row }) => {
        const rowIndex = row.index
        if (rowIndex < 3) {
          return (
            <div className="text-center">
              {getMedalEmoji(rowIndex + 1)}
            </div>
          )
        }
        return null
      },
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Player",
      cell: ({ row }) => (
        <div className="text-lg font-semibold">{row.getValue("name")}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "averageScore",
      header: "Average",
      cell: ({ row }) => (
        <div className="text-lg font-semibold">
          {parseFloat(row.getValue("averageScore")).toFixed(2)}
        </div>
      ),
      size: 100,
    },
    ...Array.from({ length: rounds }, (_, i) => i + 1).map((round): ColumnDef<PlayerScore> => ({
      accessorKey: `scores.${round}`,
      header: () => {
        const cupForRound = cups.find(cup => cup.round === round);
        return (
          <div className="flex flex-col items-center">
            <span>Round {round}</span>
            {cupForRound && <span className="text-2xl">{cupForRound.icon}</span>}
          </div>
        );
      },
      cell: ({ row, table }) => {
        const score = row.original.scores[round];
        if (score === undefined) return '';

        const allScoresForRound = (table.options.data as PlayerScore[])
          .map(p => p.scores[round])
          .filter(s => s !== undefined);

        const topThreeScores = getTopThreeScores(allScoresForRound);
        const place = topThreeScores.indexOf(score) + 1;

        return (
          <div className="text-center">
            {score.toFixed(2)} {getMedalEmoji(place)}
          </div>
        );
      },
      size: 80,
      minSize: 80,
    })),
  ]

  const table = useReactTable({
    data: playerScores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: 40,
      size: 100,
      maxSize: 400,
    },
  })

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Scores</h2>
      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full">
          <Table className="w-full border-collapse">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.getSize(),
                      }}
                      className={`
                        ${header.index > 0 && header.index < 3 ? "bg-gray-200 text-lg font-bold" : ""}
                        border-r p-2 text-center
                      `}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${
                            header.column.getIsResizing() ? 'isResizing' : ''
                          }`,
                        }}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                      }}
                      className={`
                        ${cell.column.id === "medal" ? "w-[40px]" : ""}
                        ${cell.column.id === "name" || cell.column.id === "averageScore" ? "bg-gray-100" : ""}
                        border-r p-2 text-center
                      `}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

