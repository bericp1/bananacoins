"use client";
import { Player } from "@/lib/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlayerCard } from "./PlayerCard";
import { AverageScoreCard } from "./AverageScoreCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getTeamColor = (teamNumber: number) => {
  const colors = ["blue", "green", "yellow", "pink", "purple"];
  return colors[(teamNumber - 1) % colors.length];
};

interface PlayerGridProps {
  players: Player[];
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  isAddPlayerDialogOpen: boolean;
  setIsAddPlayerDialogOpen: (isOpen: boolean) => void;
  playerToDelete: Player | null;
  setPlayerToDelete: (player: Player | null) => void;
  isDeletePlayerDialogOpen: boolean;
  setIsDeletePlayerDialogOpen: (isOpen: boolean) => void;
  addPlayer: () => void;
  deletePlayer: () => void;
  updatePlayerScore: (uuid: string, score: number) => void;
  randomizeTeams: (teamCount: number) => void;
  resetPlayerTeam: (uuid: string) => void;
  resetAllScoresAndTeams: () => void;
  calculateAverageScore: (players: Player[]) => number;
  confirmAndSaveScores: () => void;
  areAllTeamScoresValid: () => boolean;
  teamsWithPlayers: Set<number>;
}

export function PlayerGrid({
  players,
  newPlayerName,
  setNewPlayerName,
  isAddPlayerDialogOpen,
  setIsAddPlayerDialogOpen,
  playerToDelete,
  setPlayerToDelete,
  isDeletePlayerDialogOpen,
  setIsDeletePlayerDialogOpen,
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
}: PlayerGridProps) {
  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Teams</h2>
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 mb-8">
        <Button onClick={() => randomizeTeams(2)}>
          Randomize into 2 teams
        </Button>
        <Button onClick={() => randomizeTeams(3)} disabled={players.length < 3}>
          Randomize into 3 teams
        </Button>
        <Dialog
          open={isAddPlayerDialogOpen}
          onOpenChange={setIsAddPlayerDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>Add Player</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
              <DialogDescription>
                Enter the name of the new player to add them to the game.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddPlayerDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={addPlayer}>Add Player</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={resetAllScoresAndTeams} variant="outline">
          Reset All Scores and Teams
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* No Team Column */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">No Team</h3>
          <div className="space-y-4">
            {players
              .filter((player) => player.team === null)
              .map((player) => (
                <PlayerCard
                  key={player.uuid}
                  player={player}
                  updatePlayerScore={updatePlayerScore}
                  resetPlayerTeam={resetPlayerTeam}
                  setPlayerToDelete={setPlayerToDelete}
                  setIsDeletePlayerDialogOpen={setIsDeletePlayerDialogOpen}
                />
              ))}
          </div>
        </div>

        {/* Team Columns */}
        {Array.from(
          { length: Math.max(...players.map((p) => p.team || 0)) },
          (_, i) => i + 1,
        ).map((teamNumber) => {
          const teamColor = getTeamColor(teamNumber);
          return (
            <div
              key={teamNumber}
              className={`p-4 rounded-lg ${
                teamColor === "blue"
                  ? "bg-blue-100"
                  : teamColor === "green"
                    ? "bg-green-100"
                    : teamColor === "yellow"
                      ? "bg-yellow-100"
                      : teamColor === "pink"
                        ? "bg-pink-100"
                        : "bg-purple-100"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Team {teamNumber}</h3>
              <div className="space-y-4">
                {players
                  .filter((player) => player.team === teamNumber)
                  .map((player) => (
                    <PlayerCard
                      key={player.uuid}
                      player={player}
                      updatePlayerScore={updatePlayerScore}
                      resetPlayerTeam={resetPlayerTeam}
                      setPlayerToDelete={setPlayerToDelete}
                      setIsDeletePlayerDialogOpen={setIsDeletePlayerDialogOpen}
                    />
                  ))}
              </div>
              <div className="mt-4">
                <AverageScoreCard
                  averageScore={calculateAverageScore(
                    players.filter((player) => player.team === teamNumber),
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
      <Dialog
        open={isDeletePlayerDialogOpen}
        onOpenChange={setIsDeletePlayerDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Player</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {playerToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeletePlayerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deletePlayer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8 mb-8 flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={confirmAndSaveScores}
                  className="text-lg py-8 px-3"
                  disabled={!areAllTeamScoresValid()}
                >
                  Confirm and Save Scores for Round
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {teamsWithPlayers.size < 2
                ? "At least 2 teams are required to save the round."
                : !areAllTeamScoresValid()
                  ? "All players in teams must have a positive score to save the round."
                  : "Save the current round scores and start a new round."}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
