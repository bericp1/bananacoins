"use client";
import { useState, useRef } from "react";
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
import { Wand2, Upload, Loader2, X } from "lucide-react";

const getTeamColor = (teamNumber: number) => {
  const colors = ["blue", "green", "yellow", "pink", "purple"];
  return colors[(teamNumber - 1) % colors.length];
};

interface PlayerGridProps {
  year: number;
  players: Player[];
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  isAddPlayerDialogOpen: boolean;
  setIsAddPlayerDialogOpen: (isOpen: boolean) => void;
  addPlayer: () => void;
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
  year,
  players,
  newPlayerName,
  setNewPlayerName,
  isAddPlayerDialogOpen,
  setIsAddPlayerDialogOpen,
  addPlayer,
  updatePlayerScore,
  randomizeTeams,
  resetPlayerTeam,
  resetAllScoresAndTeams,
  calculateAverageScore,
  confirmAndSaveScores,
  areAllTeamScoresValid,
  teamsWithPlayers,
}: PlayerGridProps) {
  const [isParseDialogOpen, setIsParseDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsedScores, setParsedScores] = useState<Record<
    string,
    number
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidImageFile = (file: File): boolean => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".heic",
      ".heif",
    ];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext),
    );
    const hasValidType =
      file.type &&
      validTypes.some((type) =>
        file.type.toLowerCase().includes(type.toLowerCase()),
      );

    return hasValidType || hasValidExtension || file.type.startsWith("image/");
  };

  const isHeicFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return (
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif") ||
      file.type?.toLowerCase().includes("heic") ||
      file.type?.toLowerCase().includes("heif")
    );
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      setParsedScores(null);
      setError(null);
      return;
    }

    if (!isValidImageFile(file)) {
      setError(
        `Please select a valid image file (PNG, JPG, HEIC, etc.). File type: ${file.type || "unknown"}`,
      );
      return;
    }

    setSelectedImage(file);
    setError(null);
    setParsedScores(null);

    if (isHeicFile(file)) {
      setImagePreview(null);
      setIsLoadingPreview(false);
      return;
    }

    setImagePreview(null);
    setIsLoadingPreview(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setIsLoadingPreview(false);
      if (reader.result && typeof reader.result === "string") {
        setImagePreview(reader.result);
      } else {
        setError("Failed to load image preview");
        setSelectedImage(null);
      }
    };
    reader.onerror = () => {
      setIsLoadingPreview(false);
      setError(
        "Failed to read image file. The file may be corrupted or in an unsupported format.",
      );
      setSelectedImage(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleImageSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const handleParseScores = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const playerNames = players.map((p) => p.name);
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("players", JSON.stringify(playerNames));

      const response = await fetch("/api/scores/aiparse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to parse scores");
      }

      const data = await response.json();
      setParsedScores(data.scores || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse scores");
      setParsedScores(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmScores = () => {
    if (!parsedScores) return;

    const playerNameMap = new Map(
      players.map((p) => [p.name.toLowerCase(), p]),
    );

    let matchedCount = 0;
    const unmatchedNames: string[] = [];

    Object.entries(parsedScores).forEach(([name, score]) => {
      const player = playerNameMap.get(name.toLowerCase());
      if (player) {
        updatePlayerScore(player.uuid, score);
        matchedCount++;
      } else {
        unmatchedNames.push(name);
      }
    });

    if (matchedCount === 0) {
      setError(
        "No players matched the parsed scores. Please check player names.",
      );
      return;
    }

    if (unmatchedNames.length > 0) {
      console.warn("Unmatched player names:", unmatchedNames);
    }

    handleDialogOpenChange(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsParseDialogOpen(open);
    if (!open) {
      setSelectedImage(null);
      setImagePreview(null);
      setParsedScores(null);
      setError(null);
      setIsLoading(false);
      setIsLoadingPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Teams</h2>
      <h3 className="text-lg font-bold mb-4 text-center">Year: {year}</h3>
      <div className="flex flex-col md:flex-row flex-wrap justify-center gap-2 mb-8">
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
        <Dialog open={isParseDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Wand2 className="h-4 w-4 mr-2" />
              Parse Scores From Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Parse Scores From Photo</DialogTitle>
              <DialogDescription>
                Upload a screenshot of scores to automatically parse and apply
                them to players.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!imagePreview && !isLoadingPreview && (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </span>
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, HEIC up to 10MB
                  </p>
                </div>
              )}

              {isLoadingPreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
                  <p className="text-sm text-gray-600">
                    Loading image preview...
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {selectedImage &&
                !imagePreview &&
                !isLoadingPreview &&
                !error && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            HEIC file selected
                          </p>
                          <p className="text-sm text-blue-700 mb-2">
                            {selectedImage.name}
                          </p>
                          <p className="text-xs text-blue-600">
                            HEIC files cannot be previewed in the browser, but
                            you can still parse scores from them.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImageSelect(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {!parsedScores && !isLoading && (
                      <Button
                        onClick={handleParseScores}
                        className="w-full"
                        disabled={!selectedImage}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Parse Scores
                      </Button>
                    )}

                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-600">
                          Parsing scores...
                        </span>
                      </div>
                    )}

                    {parsedScores && (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            Scores parsed successfully!
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {Object.entries(parsedScores)
                              .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                              .map(([name, score]) => {
                                const player = players.find(
                                  (p) =>
                                    p.name.toLowerCase() === name.toLowerCase(),
                                );
                                return (
                                  <div
                                    key={name}
                                    className={`flex justify-between items-center text-sm p-2 rounded ${
                                      player
                                        ? "bg-white"
                                        : "bg-yellow-50 border border-yellow-200"
                                    }`}
                                  >
                                    <span
                                      className={
                                        player
                                          ? "text-gray-800"
                                          : "text-yellow-800"
                                      }
                                    >
                                      {name}
                                    </span>
                                    <span
                                      className={
                                        player
                                          ? "font-medium text-gray-800"
                                          : "text-yellow-800"
                                      }
                                    >
                                      {score}
                                      {!player && (
                                        <span className="ml-2 text-xs text-yellow-600">
                                          (not found)
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {imagePreview && (
                <div className="space-y-4">
                  <div className="relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-96 object-contain rounded-lg"
                      onError={() => {
                        setError("Failed to display image preview");
                        setImagePreview(null);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleImageSelect(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {!parsedScores && !isLoading && (
                    <Button
                      onClick={handleParseScores}
                      className="w-full"
                      disabled={!selectedImage}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Parse Scores
                    </Button>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">
                        Parsing scores...
                      </span>
                    </div>
                  )}

                  {parsedScores && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          Scores parsed successfully!
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {Object.entries(parsedScores)
                            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                            .map(([name, score]) => {
                              const player = players.find(
                                (p) =>
                                  p.name.toLowerCase() === name.toLowerCase(),
                              );
                              return (
                                <div
                                  key={name}
                                  className={`flex justify-between items-center text-sm p-2 rounded ${
                                    player
                                      ? "bg-white"
                                      : "bg-yellow-50 border border-yellow-200"
                                  }`}
                                >
                                  <span
                                    className={
                                      player
                                        ? "text-gray-800"
                                        : "text-yellow-800"
                                    }
                                  >
                                    {name}
                                  </span>
                                  <span
                                    className={
                                      player
                                        ? "font-medium text-gray-800"
                                        : "text-yellow-800"
                                    }
                                  >
                                    {score}
                                    {!player && (
                                      <span className="ml-2 text-xs text-yellow-600">
                                        (not found)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {parsedScores && (
                <Button
                  onClick={handleConfirmScores}
                  className="w-full sm:w-auto"
                >
                  Confirm and Apply Scores
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
      <div className="mt-8 mb-8 flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={confirmAndSaveScores}
                  className="py-6 px-3"
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
