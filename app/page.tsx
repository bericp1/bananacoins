"use client";
import { CupGrid } from "@/components/cups/CupGrid";
import { PlayerGrid } from "@/components/players/PlayerGrid";
import { ScoreGrid } from "@/components/scores/ScoreGrid";
import { usePlayersAndScores } from "@/hooks/usePlayersAndScores";
import { useCups } from "@/hooks/cups/useCups";
import Hero from "@/components/hero/Hero";

export default function Home() {
  const {
    players,
    newPlayerName,
    setNewPlayerName,
    isAddPlayerDialogOpen,
    setIsAddPlayerDialogOpen,
    playerToDelete,
    setPlayerToDelete,
    isDeletePlayerDialogOpen,
    setIsDeletePlayerDialogOpen,
    playerScores,
    addPlayer,
    deletePlayer,
    updatePlayerScore,
    randomizeTeams,
    resetPlayerTeam,
    resetAllScoresAndTeams,
    calculateAverageScore,
    confirmAndSaveScores,
    areAllTeamScoresValid,
    teamsWithPlayers,
  } = usePlayersAndScores();

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
  } = useCups();

  return (
    <>
      <Hero />
      <div className="container mt-8 px-6 text-center mx-auto">
        <p className="font-semibold mb-8">
          <span className="text-orange-500">⚡️</span> All selections and changes
          are visible to everyone in realtime.
        </p>
      </div>
      <hr className="my-8 border-t border-gray-300" />
      <CupGrid
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
        players={players}
        newPlayerName={newPlayerName}
        setNewPlayerName={setNewPlayerName}
        isAddPlayerDialogOpen={isAddPlayerDialogOpen}
        setIsAddPlayerDialogOpen={setIsAddPlayerDialogOpen}
        playerToDelete={playerToDelete}
        setPlayerToDelete={setPlayerToDelete}
        isDeletePlayerDialogOpen={isDeletePlayerDialogOpen}
        setIsDeletePlayerDialogOpen={setIsDeletePlayerDialogOpen}
        addPlayer={addPlayer}
        deletePlayer={deletePlayer}
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
      <ScoreGrid playerScores={playerScores} cups={cups} />
    </>
  );
}
