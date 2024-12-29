"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Player } from "@/lib/players";
import { Score, PlayerScore } from "@/lib/scores";

export function usePlayersAndScores() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeletePlayerDialogOpen, setIsDeletePlayerDialogOpen] =
    useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [teamsWithPlayers, setTeamsWithPlayers] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    fetchPlayers();
    fetchScores();

    const playerSubscription = supabase
      .channel("players")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        fetchPlayers,
      )
      .subscribe();

    const scoreSubscription = supabase
      .channel("scores")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        fetchScores,
      )
      .subscribe();

    return () => {
      playerSubscription.unsubscribe();
      scoreSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const teams = new Set(
      players
        .filter(
          (player): player is Player & { team: number } => player.team !== null,
        )
        .map((player) => player.team),
    );
    setTeamsWithPlayers(teams);
  }, [players]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("team", { ascending: true, nullsFirst: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching players:", error);
      return;
    }

    setPlayers(data);
  };

  const fetchScores = async () => {
    const { data: scoresData, error: scoresError } = await supabase
      .from("scores")
      .select("*");

    if (scoresError) {
      console.error("Error fetching scores:", scoresError);
      return;
    }

    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("uuid, name");

    if (playersError) {
      console.error("Error fetching players:", playersError);
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

    scoresData.forEach((score: Score) => {
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

    processedPlayerScores.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return a.name.localeCompare(b.name);
    });

    setPlayerScores(processedPlayerScores);
  };

  const addPlayer = async () => {
    const { data, error } = await supabase
      .from("players")
      .insert({
        name: newPlayerName,
      })
      .select();

    if (error) {
      console.error("Error adding player:", error);
    } else if (data) {
      setPlayers((prev) => [...prev, data[0]]);
    }
    setNewPlayerName("");
    setIsAddPlayerDialogOpen(false);
  };

  const deletePlayer = async () => {
    if (!playerToDelete) return;

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("uuid", playerToDelete.uuid);

    if (error) {
      console.error("Error deleting player:", error);
    } else {
      setPlayers((prev) =>
        prev.filter((player) => player.uuid !== playerToDelete.uuid),
      );
    }
    setPlayerToDelete(null);
    setIsDeletePlayerDialogOpen(false);
  };

  const updatePlayerScore = async (uuid: string, score: number) => {
    if (isNaN(score) || score < 0) return;

    const { error } = await supabase
      .from("players")
      .update({ score })
      .eq("uuid", uuid);

    if (error) {
      console.error("Error updating player score:", error);
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.uuid === uuid ? { ...p, score } : p)),
      );
    }
  };

  const randomizeTeams = (teamCount: number) => {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const updates = shuffled.map((player, index) => ({
      uuid: player.uuid,
      name: player.name,
      team: (index % teamCount) + 1,
      score: 0,
    }));

    supabase
      .from("players")
      .upsert(updates)
      .then(({ error }) => {
        if (error) {
          console.error("Error randomizing teams:", error);
        } else {
          setPlayers((prev) =>
            prev
              .map((player) => {
                const update = updates.find((u) => u.uuid === player.uuid);
                return update ? { ...player, ...update } : player;
              })
              .sort((a, b) => {
                if (a.team === null && b.team !== null) return -1;
                if (a.team !== null && b.team === null) return 1;
                if (a.team === b.team) return a.name.localeCompare(b.name);
                return (a.team || 0) - (b.team || 0);
              }),
          );
        }
      });
  };

  const resetPlayerTeam = async (uuid: string) => {
    const { error } = await supabase
      .from("players")
      .update({ team: null, score: 0 })
      .eq("uuid", uuid);

    if (error) {
      console.error("Error resetting player team:", error);
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.uuid === uuid ? { ...p, team: null, score: 0 } : p)),
      );
    }
  };

  const resetAllScoresAndTeams = async () => {
    const { error } = await supabase
      .from("players")
      .update({ score: 0, team: null })
      .in(
        "uuid",
        players.map((player) => player.uuid),
      );

    if (error) {
      console.error("Error resetting all scores and teams:", error);
    } else {
      setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, team: null })));
    }
  };

  const calculateAverageScore = (teamPlayers: Player[]) => {
    if (teamPlayers.length === 0) return 0;
    const sum = teamPlayers.reduce((acc, player) => acc + player.score, 0);
    return sum / teamPlayers.length;
  };

  const confirmAndSaveScores = async () => {
    const { data: maxRoundData, error: maxRoundError } = await supabase
      .from("scores")
      .select("round")
      .order("round", { ascending: false })
      .limit(1);

    if (maxRoundError) {
      console.error("Error fetching max round:", maxRoundError);
      return;
    }

    const nextRound =
      maxRoundData && maxRoundData.length > 0 ? maxRoundData[0].round + 1 : 1;

    const teamAverages = players.reduce(
      (acc, player) => {
        if (player.team !== null) {
          if (!acc[player.team]) {
            acc[player.team] = { total: 0, count: 0 };
          }
          acc[player.team].total += player.score;
          acc[player.team].count++;
        }
        return acc;
      },
      {} as Record<number, { total: number; count: number }>,
    );

    const teamScores = Object.entries(teamAverages).reduce(
      (acc, [team, { total, count }]) => {
        acc[parseInt(team)] = total / count;
        return acc;
      },
      {} as Record<number, number>,
    );

    const scoresToInsert = players
      .filter((player) => player.team !== null)
      .map((player) => ({
        player: player.uuid,
        round: nextRound,
        score: teamScores[player.team!],
      }));

    const { error: insertError } = await supabase
      .from("scores")
      .insert(scoresToInsert);

    if (insertError) {
      console.error("Error inserting scores:", insertError);
      return;
    }

    await resetAllScoresAndTeams();
    fetchScores();
  };

  const areAllTeamScoresValid = () => {
    const teamsWithPlayers = new Set(
      players
        .filter((player) => player.team !== null)
        .map((player) => player.team),
    );
    return (
      teamsWithPlayers.size >= 2 &&
      players.every(
        (player) =>
          player.team === null || (player.score > 0 && player.score !== null),
      )
    );
  };

  return {
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
  };
}
