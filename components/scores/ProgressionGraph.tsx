"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PlayerScore } from "@/lib/scores";
import { Cup } from "@/lib/cups";
import { Button } from "@/components/ui/button";

interface ProgressionGraphProps {
  playerScores: PlayerScore[];
  cups: Cup[];
}

type ViewMode = "place" | "score";

const PLAYER_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

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

export function ProgressionGraph({
  playerScores,
  cups,
}: ProgressionGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("place");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rounds =
    playerScores.length > 0
      ? Math.max(
          ...playerScores.flatMap((p) => Object.keys(p.scores).map(Number)),
        )
      : 0;

  if (rounds === 0 || playerScores.length === 0) {
    return null;
  }

  const calculatePlaceForRound = (
    round: number,
    playerUuid: string,
  ): number | null => {
    const scoresForRound = playerScores
      .map((p) => ({
        uuid: p.uuid,
        score: p.scores[round],
      }))
      .filter((p) => p.score !== undefined)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    const playerIndex = scoresForRound.findIndex((p) => p.uuid === playerUuid);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  };

  const graphData = Array.from({ length: rounds }, (_, i) => {
    const round = i + 1;
    const cupForRound = cups.find((c) => c.round === round);
    const dataPoint: { [key: string]: string | number | null } = {
      round,
      roundLabel: cupForRound ? `${cupForRound.icon}` : `R${round}`,
    };

    playerScores.forEach((player) => {
      const score = player.scores[round];
      if (score !== undefined) {
        if (viewMode === "place") {
          dataPoint[player.name] = calculatePlaceForRound(round, player.uuid);
        } else {
          dataPoint[player.name] = score;
        }
      } else {
        dataPoint[player.name] = null;
      }
    });

    return dataPoint;
  });

  const activePlayers = playerScores.filter((p) =>
    Object.keys(p.scores).some(
      (round) => p.scores[Number(round)] !== undefined,
    ),
  );

  const maxPlace = Math.max(6, activePlayers.length);
  const placeTicks = Array.from({ length: maxPlace }, (_, i) => i + 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index, dataKey } = props;

    if (index !== graphData.length - 1) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={props.fill}
          stroke={props.stroke}
          strokeWidth={2}
        />
      );
    }

    const playerUuid =
      activePlayers.find((p) => p.name === dataKey)?.uuid || "";
    const place = calculatePlaceForRound(rounds, playerUuid);
    const medal = place ? getMedalEmoji(place) : "";
    const playerName = dataKey;

    return (
      <>
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={props.fill}
          stroke={props.stroke}
          strokeWidth={2}
        />
        {!isMobile && (
          <text
            x={cx + 12}
            y={cy + 5}
            textAnchor="start"
            fontSize="14"
            fontWeight="600"
            fill={props.stroke}
          >
            {medal && `${medal} `}
            {playerName}
          </text>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Player Progression
      </h2>

      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="text-sm font-medium text-gray-700">View by:</div>
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
          <Button
            onClick={() => setViewMode("place")}
            variant={viewMode === "place" ? "default" : "ghost"}
            className={`rounded-none border-0 ${
              viewMode === "place"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Place
          </Button>
          <div className="w-px bg-gray-300" />
          <Button
            onClick={() => setViewMode("score")}
            variant={viewMode === "score" ? "default" : "ghost"}
            className={`rounded-none border-0 ${
              viewMode === "score"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Score
          </Button>
        </div>
      </div>

      <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={graphData}
            margin={
              isMobile
                ? { top: 20, right: 30, left: 20, bottom: 30 }
                : { top: 20, right: 120, left: 20, bottom: 30 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="roundLabel"
              label={{ value: "Round", position: "insideBottom", offset: -10 }}
              interval={0}
              tick={{ fontSize: 14 }}
            />
            <YAxis
              reversed={viewMode === "place"}
              label={{
                value: viewMode === "place" ? "Place" : "Score",
                angle: -90,
                position: "insideLeft",
              }}
              domain={viewMode === "place" ? [1, maxPlace] : ["auto", "auto"]}
              ticks={viewMode === "place" ? placeTicks : undefined}
              interval={0}
              tick={{ fontSize: 14 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            {isMobile && (
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
            )}
            {activePlayers.map((player, index) => (
              <Line
                key={player.uuid}
                type="monotone"
                dataKey={player.name}
                stroke={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
