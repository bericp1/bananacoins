"use client";
import { CupGrid } from "@/components/CupGrid";
import { PlayerGrid } from "@/app/components/players/PlayerGrid";
import { ScoreGrid } from "@/components/ScoreGrid";
import { usePlayersAndScores } from "./hooks/usePlayersAndScores";
import { useCups } from "./hooks/useCups";

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
      <div className="container mt-8 px-6 text-center mx-auto">
        <h1 className="text-4xl font-bold mb-4">MarioKart 8 2024-25</h1>
        <p className="text-orange-500 font-semibold mb-8">
          Warning: All selections and changes are visible to everyone using this
          randomizer.
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
