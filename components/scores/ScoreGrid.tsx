"use client";
import type { ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlayerScore } from "@/lib/scores";
import { Cup } from "@/lib/cups";
import { ComparisonMode } from "@/hooks/scores/useScoreComparisons";
import { ComparisonToggle } from "./ComparisonToggle";

interface ScoreGridProps {
  playerScores: PlayerScore[];
  cups: Cup[];
  comparisonMode: ComparisonMode;
  setComparisonMode: (mode: ComparisonMode) => void;
  previousYearScores: PlayerScore[];
  previousYearCups: Cup[];
  hasPreviousYear: boolean;
}

const getMedalEmoji = (place: number) => {
  switch (place) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "";
  }
};

export function ScoreGrid({
  playerScores,
  cups,
  comparisonMode,
  setComparisonMode,
  previousYearScores,
  previousYearCups,
  hasPreviousYear,
}: ScoreGridProps) {
  const rounds =
    playerScores.length > 0
      ? Math.max(
          ...playerScores.flatMap((p) => Object.keys(p.scores).map(Number)),
        )
      : 0;

  const getTopThreeScores = (roundScores: number[]): number[] => {
    const sortedScores = [...new Set(roundScores)].sort((a, b) => b - a);
    return sortedScores.slice(0, 3);
  };

  const getPreviousYearScore = (
    playerUuid: string,
    currentRound: number,
  ): number | undefined => {
    const previousPlayer = previousYearScores.find(
      (p) => p.uuid === playerUuid,
    );
    if (!previousPlayer) return undefined;

    if (comparisonMode === "round") {
      return previousPlayer.scores[currentRound];
    } else {
      const currentCup = cups.find((c) => c.round === currentRound);
      if (!currentCup) return undefined;

      const previousRound = previousYearCups.find(
        (c) => c.cup === currentCup.cup,
      )?.round;
      if (!previousRound) return undefined;

      return previousPlayer.scores[previousRound];
    }
  };

  const getComparisonIndicator = (
    currentScore: number,
    previousScore: number | undefined,
  ): ReactElement | null => {
    if (!hasPreviousYear || previousScore === undefined) return null;

    const diff = currentScore - previousScore;
    if (Math.abs(diff) < 0.01) return null;

    const color = diff > 0 ? "text-green-600" : "text-red-600";
    const arrow = diff > 0 ? "↑" : "↓";

    return (
      <span className={`text-xs ${color} font-semibold ml-1`}>
        {arrow} {Math.abs(diff).toFixed(2)}
      </span>
    );
  };

  const columns: ColumnDef<PlayerScore>[] = [
    {
      id: "medal",
      header: () => null,
      cell: ({ row }) => {
        const rowIndex = row.index;
        if (rowIndex < 3) {
          return (
            <div className="text-center">
              <span className="scale-[1.8] inline-block transition-transform">
                {getMedalEmoji(rowIndex + 1)}
              </span>
            </div>
          );
        }
        return null;
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
    ...Array.from({ length: rounds }, (_, i) => i + 1).map(
      (round): ColumnDef<PlayerScore> => ({
        accessorKey: `scores.${round}`,
        header: () => {
          const cupForRound = cups.find((cup) => cup.round === round);
          return (
            <div className="flex flex-col items-center">
              <span>Round {round}</span>
              {cupForRound && (
                <span className="text-2xl">{cupForRound.icon}</span>
              )}
            </div>
          );
        },
        cell: ({ row, table }) => {
          const score = row.original.scores[round];
          if (score === undefined) return "";

          const allScoresForRound = (table.options.data as PlayerScore[])
            .map((p) => p.scores[round])
            .filter((s) => s !== undefined);

          const topThreeScores = getTopThreeScores(allScoresForRound);
          const place = topThreeScores.indexOf(score) + 1;

          const previousScore = getPreviousYearScore(row.original.uuid, round);
          const comparisonIndicator = getComparisonIndicator(
            score,
            previousScore,
          );

          return (
            <div className="text-center">
              <div>
                {score.toFixed(2)}{" "}
                <span className="scale-[1.6] inline-block transition-transform">
                  {getMedalEmoji(place)}
                </span>
              </div>
              {comparisonIndicator && (
                <div className="mt-0.5">{comparisonIndicator}</div>
              )}
            </div>
          );
        },
        size: 80,
        minSize: 80,
      }),
    ),
  ];

  const table = useReactTable({
    data: playerScores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    defaultColumn: {
      minSize: 40,
      size: 100,
      maxSize: 400,
    },
  });

  return (
    <div className="container mx-auto px-4 pt-4 pb-64">
      <h2 className="text-3xl font-bold mb-8 text-center">Scores</h2>
      <ComparisonToggle
        comparisonMode={comparisonMode}
        onModeChange={setComparisonMode}
        disabled={!hasPreviousYear}
      />
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
                            header.getContext(),
                          )}
                      <div
                        {...{
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
