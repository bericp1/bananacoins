"use client";

import { useState } from "react";
import { Player } from "@/lib/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMinus } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  updatePlayerScore: (uuid: string, score: number) => void;
  resetPlayerTeam: (uuid: string) => void;
}

function PlayerCardInner({
  player,
  updatePlayerScore,
  resetPlayerTeam,
}: PlayerCardProps) {
  const [localScore, setLocalScore] = useState(player.score.toString());
  const [isValid, setIsValid] = useState(true);

  const handleScoreChange = (value: string) => {
    setLocalScore(value);
    const parsedValue = parseInt(value, 10);
    setIsValid(!isNaN(parsedValue) && parsedValue >= 0);
  };

  const handleScoreBlur = () => {
    const trimmedValue = localScore.trim();
    if (trimmedValue === "") {
      updatePlayerScore(player.uuid, 0);
      setLocalScore("0");
      setIsValid(true);
    } else {
      const parsedValue = parseInt(trimmedValue, 10);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        updatePlayerScore(player.uuid, parsedValue);
      } else {
        setLocalScore(player.score.toString());
        setIsValid(true);
      }
    }
  };

  return (
    <Card className="shadow-sm relative">
      <CardHeader className="p-3">
        <CardTitle className="text-sm">{player.name}</CardTitle>
        {player.team && (
          <p className="text-xs text-gray-500">Team {player.team}</p>
        )}
        {player.team !== null && (
          <Button
            onClick={() => resetPlayerTeam(player.uuid)}
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 p-2"
          >
            <span className="sr-only">Reset Team</span>
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      {player.team !== null && (
        <CardContent className="p-3">
          <label
            htmlFor={`score-${player.uuid}`}
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Score
          </label>
          <Input
            id={`score-${player.uuid}`}
            type="text"
            value={localScore}
            onChange={(e) => handleScoreChange(e.target.value)}
            onBlur={handleScoreBlur}
            className={`w-full mb-2 text-sm ${!isValid ? "border-red-500 focus:ring-red-500" : ""}`}
          />
        </CardContent>
      )}
    </Card>
  );
}

export function PlayerCard(props: PlayerCardProps) {
  return (
    <PlayerCardInner
      key={`${props.player.uuid}-${props.player.score}`}
      {...props}
    />
  );
}
