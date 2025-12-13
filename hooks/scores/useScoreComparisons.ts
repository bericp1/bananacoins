"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PlayerScore } from "@/lib/scores";
import { Cup, cups as staticCups } from "@/lib/cups";

export type ComparisonMode = "cup" | "round";

export function useScoreComparisons({
  selectedYear,
  availableYears,
}: {
  selectedYear: number;
  availableYears: number[];
}) {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("round");
  const [previousYearScores, setPreviousYearScores] = useState<PlayerScore[]>(
    [],
  );
  const [previousYearCups, setPreviousYearCups] = useState<Cup[]>([]);

  const hasPreviousYear = availableYears.includes(selectedYear - 1);
  const previousYear = selectedYear - 1;

  useEffect(() => {
    if (!hasPreviousYear) {
      setPreviousYearScores([]);
      setPreviousYearCups([]);
      return;
    }

    const fetchPreviousYearData = async () => {
      const { data: scoresData, error: scoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("year", previousYear);

      if (scoresError) {
        console.error("Error fetching previous year scores:", scoresError);
        return;
      }

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("uuid, name");

      if (playersError) {
        console.error("Error fetching players:", playersError);
        return;
      }

      const { data: cupsData, error: cupsError } = await supabase
        .from("cups_rounds")
        .select("cup, round")
        .eq("year", previousYear);

      if (cupsError) {
        console.error("Error fetching previous year cups:", cupsError);
        return;
      }

      const playerScoresMap: { [uuid: string]: PlayerScore } = {};

      playersData.forEach((player) => {
        playerScoresMap[player.uuid] = {
          uuid: player.uuid,
          name: player.name,
          averageScore: 0,
          scores: {},
        };
      });

      scoresData.forEach((score) => {
        if (playerScoresMap[score.player]) {
          playerScoresMap[score.player].scores[score.round] = score.score;
        }
      });

      const processedPlayerScores = Object.values(playerScoresMap).map(
        (playerScore) => {
          const scores = Object.values(playerScore.scores);
          const validScores = scores.filter(
            (score) => score !== undefined && score !== null,
          );
          const averageScore =
            validScores.length > 0
              ? validScores.reduce((a, b) => a + b, 0) / validScores.length
              : 0;
          return { ...playerScore, averageScore };
        },
      );

      const mappedCups: Cup[] = (cupsData || []).map((dbCup) => {
        const staticCup = staticCups.find((c) => c.cup === dbCup.cup);
        return {
          ...(staticCup || { name: "", cup: dbCup.cup, icon: "" }),
          round: dbCup.round,
        };
      });

      setPreviousYearScores(processedPlayerScores);
      setPreviousYearCups(mappedCups);
    };

    fetchPreviousYearData();
  }, [selectedYear, hasPreviousYear, previousYear]);

  return {
    comparisonMode,
    setComparisonMode,
    previousYearScores,
    previousYearCups,
    hasPreviousYear,
  };
}
