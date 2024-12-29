"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { cups as initialCups } from "@/app/constants/cups";
import { Cup } from "@/app/lib/types";

export function useCups() {
  const [cups, setCups] = useState<Cup[]>([]);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [cupToReset, setCupToReset] = useState<Cup | null>(null);
  const [isResetCupDialogOpen, setIsResetCupDialogOpen] = useState(false);
  const [cupToAssign, setCupToAssign] = useState<Cup | null>(null);
  const [isAssignCupDialogOpen, setIsAssignCupDialogOpen] = useState(false);

  useEffect(() => {
    fetchCups();
    const cupSubscription = supabase
      .channel("cups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cups" },
        fetchCups,
      )
      .subscribe();

    return () => {
      cupSubscription.unsubscribe();
    };
  }, []);

  const fetchCups = async () => {
    const { data, error } = await supabase
      .from("cups")
      .select("*")
      .order("round", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching cups:", error);
      return;
    }

    const mergedCups = initialCups.map((cup) => {
      const dbCup = data.find((dbCup) => dbCup.cup === cup.cup);
      return { ...cup, ...dbCup };
    });

    setCups(mergedCups);
  };

  const selectRandomCup = async () => {
    const unplayedCups = cups.filter((cup) => cup.round === null);
    if (unplayedCups.length === 0) return;

    const randomIndex = Math.floor(Math.random() * unplayedCups.length);
    const selectedCup = unplayedCups[randomIndex];

    const maxRound = Math.max(...cups.map((cup) => cup.round || 0));
    const newRound = maxRound + 1;

    const { error } = await supabase
      .from("cups")
      .update({ round: newRound })
      .eq("cup", selectedCup.cup);

    if (error) {
      console.error("Error updating cup:", error);
    } else {
      setCups((prev) =>
        prev.map((cup) =>
          cup.cup === selectedCup.cup ? { ...cup, round: newRound } : cup,
        ),
      );
    }
  };

  const toggleCup = async (cup: Cup) => {
    if (cup.round === null) {
      setCupToAssign(cup);
      setIsAssignCupDialogOpen(true);
    } else if (cup.round === Math.max(...cups.map((c) => c.round || 0))) {
      // Check if there are scores for this round
      const { data, error } = await supabase
        .from("scores")
        .select("round")
        .eq("round", cup.round)
        .limit(1);

      if (error) {
        console.error("Error checking scores:", error);
        return;
      }

      if (data && data.length > 0) {
        // There are scores for this round, don't allow resetting
        return;
      }

      setCupToReset(cup);
      setIsResetCupDialogOpen(true);
    }
  };

  const confirmAssignCup = async () => {
    if (!cupToAssign) return;

    const maxRound = Math.max(...cups.map((cup) => cup.round || 0));
    const newRound = maxRound + 1;

    const { error } = await supabase
      .from("cups")
      .update({ round: newRound })
      .eq("cup", cupToAssign.cup);

    if (error) {
      console.error("Error updating cup:", error);
    } else {
      setCups((prev) =>
        prev.map((c) =>
          c.cup === cupToAssign.cup ? { ...c, round: newRound } : c,
        ),
      );
    }
    setIsAssignCupDialogOpen(false);
    setCupToAssign(null);
  };

  const confirmResetCup = async () => {
    if (!cupToReset) return;

    const { error } = await supabase
      .from("cups")
      .update({ round: null })
      .eq("cup", cupToReset.cup);

    if (error) {
      console.error("Error resetting cup:", error);
    } else {
      setCups((prev) =>
        prev.map((cup) =>
          cup.cup === cupToReset.cup ? { ...cup, round: null } : cup,
        ),
      );
    }
    setIsResetCupDialogOpen(false);
    setCupToReset(null);
  };

  const resetAllCups = async () => {
    const { error } = await supabase
      .from("cups")
      .update({ round: null })
      .neq("cup", "non_existent_cup"); // This condition will update all rows

    if (error) {
      console.error("Error resetting cups:", error);
    } else {
      setCups((prev) => prev.map((cup) => ({ ...cup, round: null })));
    }
    setIsResetDialogOpen(false);
  };

  return {
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
  };
}
