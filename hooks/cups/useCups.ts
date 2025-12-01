"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cups as initialCups, Cup } from "@/lib/cups";

async function fetchCups({
  year = new Date().getFullYear(),
}: { year?: number } = {}): Promise<Cup[]> {
  const { data, error } = await supabase
    .from("cups_rounds")
    .select(
      `
      cup,
      round
    `,
    )
    .eq("year", year)
    .order("round", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Error fetching cups:", error);
    return [];
  }

  return initialCups.map((cup) => {
    const dbCup = data.find((dbCup) => dbCup.cup === cup.cup) ?? {
      round: null,
    };
    return {
      ...cup,
      ...dbCup,
      round: dbCup?.round ?? null,
    };
  });
}

export function useCups({
  year = new Date().getFullYear(),
}: { year?: number } = {}) {
  const [cups, setCups] = useState<Cup[]>([]);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [cupToReset, setCupToReset] = useState<Cup | null>(null);
  const [isResetCupDialogOpen, setIsResetCupDialogOpen] = useState(false);
  const [cupToAssign, setCupToAssign] = useState<Cup | null>(null);
  const [isAssignCupDialogOpen, setIsAssignCupDialogOpen] = useState(false);

  useEffect(() => {
    fetchCups({ year }).then((cups) => setCups(cups));
    const cupSubscription = supabase
      .channel("cups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cups" },
        () => fetchCups(),
      )
      .subscribe();

    return () => {
      cupSubscription.unsubscribe();
    };
  }, [year]);

  const selectRandomCup = async () => {
    const unplayedCups = cups.filter((cup) => cup.round === null);
    if (unplayedCups.length === 0) return;

    const randomIndex = Math.floor(Math.random() * unplayedCups.length);
    const selectedCup = unplayedCups[randomIndex];

    const maxRound = Math.max(...cups.map((cup) => cup.round || 0));
    const newRound = maxRound + 1;

    const { error } = await supabase.from("cups_rounds").insert({
      year,
      cup: selectedCup.cup,
      round: newRound,
    });

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
        .eq("year", year)
        .eq("round", cup.round)
        .limit(1);

      if (error) {
        console.error("Error checking scores:", error);
        return;
      }

      if (data && data.length > 0) {
        // There are scores for this round, don't allow resetting
        console.error("There are scores for this round, don't allow resetting");
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

    const { error } = await supabase.from("cups_rounds").insert({
      year,
      cup: cupToAssign.cup,
      round: newRound,
    });

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
      .from("cups_rounds")
      .delete()
      .eq("year", year)
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
      .from("cups_rounds")
      .delete()
      .eq("year", year);

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
