"use client";
import { useState, useEffect } from "react";
import { CupGrid } from "@/components/cups/CupGrid";
import { PlayerGrid } from "@/components/players/PlayerGrid";
import { ScoreGrid } from "@/components/scores/ScoreGrid";
import { ProgressionGraph } from "@/components/scores/ProgressionGraph";
import { YearSelector } from "@/components/scores/YearSelector";
import { usePlayersAndScores } from "@/hooks/usePlayersAndScores";
import { useCups } from "@/hooks/cups/useCups";
import { useScoreComparisons } from "@/hooks/scores/useScoreComparisons";
import Hero from "@/components/hero/Hero";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year);
  const [availableYears, setAvailableYears] = useState<number[]>([year]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("year")
        .order("year", { ascending: false });

      if (error) {
        console.error("Error fetching years:", error);
        return;
      }

      if (data && data.length > 0) {
        const uniqueYears = Array.from(
          new Set(data.map((item) => item.year)),
        ).sort((a, b) => b - a);
        setAvailableYears(uniqueYears);

        if (!uniqueYears.includes(selectedYear)) {
          setSelectedYear(uniqueYears[0]);
        }
      }
    };

    fetchAvailableYears();
  }, [selectedYear]);

  const {
    players,
    newPlayerName,
    setNewPlayerName,
    isAddPlayerDialogOpen,
    setIsAddPlayerDialogOpen,
    playerScores,
    addPlayer,
    updatePlayerScore,
    randomizeTeams,
    resetPlayerTeam,
    resetAllScoresAndTeams,
    calculateAverageScore,
    confirmAndSaveScores,
    areAllTeamScoresValid,
    teamsWithPlayers,
  } = usePlayersAndScores({ year: selectedYear });

  const {
    cups,
    isResetDialogOpen,
    setIsResetDialogOpen,
    cupToReset,
    isResetCupDialogOpen,
    setIsResetCupDialogOpen,
    cupToAssign,
    isAssignCupDialogOpen,
    setIsAssignCupDialogOpen,
    selectRandomCup,
    toggleCup,
    confirmAssignCup,
    confirmResetCup,
    resetAllCups,
  } = useCups({ year: selectedYear });

  const {
    comparisonMode,
    setComparisonMode,
    previousYearScores,
    previousYearCups,
    hasPreviousYear,
  } = useScoreComparisons({ selectedYear, availableYears });

  return (
    <>
      <Hero />
      <YearSelector
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      <div className="container mt-8 px-6 text-center mx-auto">
        <p className="font-semibold mb-8">
          <span className="text-orange-500">⚡️</span> All selections and changes
          are visible to everyone in realtime.
        </p>
      </div>
      <hr className="my-8 border-t border-gray-300" />
      <CupGrid
        year={selectedYear}
        cups={cups}
        isResetDialogOpen={isResetDialogOpen}
        setIsResetDialogOpen={setIsResetDialogOpen}
        cupToReset={cupToReset}
        isResetCupDialogOpen={isResetCupDialogOpen}
        setIsResetCupDialogOpen={setIsResetCupDialogOpen}
        cupToAssign={cupToAssign}
        isAssignCupDialogOpen={isAssignCupDialogOpen}
        setIsAssignCupDialogOpen={setIsAssignCupDialogOpen}
        selectRandomCup={selectRandomCup}
        toggleCup={toggleCup}
        confirmAssignCup={confirmAssignCup}
        confirmResetCup={confirmResetCup}
        resetAllCups={resetAllCups}
      />
      <hr className="my-8 border-t border-gray-300" />
      <PlayerGrid
        year={selectedYear}
        players={players}
        newPlayerName={newPlayerName}
        setNewPlayerName={setNewPlayerName}
        isAddPlayerDialogOpen={isAddPlayerDialogOpen}
        setIsAddPlayerDialogOpen={setIsAddPlayerDialogOpen}
        addPlayer={addPlayer}
        updatePlayerScore={updatePlayerScore}
        randomizeTeams={randomizeTeams}
        resetPlayerTeam={resetPlayerTeam}
        resetAllScoresAndTeams={resetAllScoresAndTeams}
        calculateAverageScore={calculateAverageScore}
        confirmAndSaveScores={confirmAndSaveScores}
        areAllTeamScoresValid={areAllTeamScoresValid}
        teamsWithPlayers={teamsWithPlayers}
      />
      <hr className="my-8 border-t border-gray-300" />
      <ScoreGrid
        key={`score-grid-${selectedYear}`}
        playerScores={playerScores}
        cups={cups}
        comparisonMode={comparisonMode}
        setComparisonMode={setComparisonMode}
        previousYearScores={previousYearScores}
        previousYearCups={previousYearCups}
        hasPreviousYear={hasPreviousYear}
      />
      <hr className="my-8 border-t border-gray-300" />
      <ProgressionGraph playerScores={playerScores} cups={cups} />
    </>
  );
}
