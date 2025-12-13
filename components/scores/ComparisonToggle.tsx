"use client";
import { Button } from "@/components/ui/button";
import { ComparisonMode } from "@/hooks/scores/useScoreComparisons";

interface ComparisonToggleProps {
  comparisonMode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
  disabled?: boolean;
}

export function ComparisonToggle({
  comparisonMode,
  onModeChange,
  disabled = false,
}: ComparisonToggleProps) {
  if (disabled) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="text-sm font-medium text-gray-700">
        Comparisons anchored to:
      </div>
      <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
        <div className="w-px bg-gray-300" />
        <Button
          onClick={() => onModeChange("round")}
          variant={comparisonMode === "round" ? "default" : "ghost"}
          className={`rounded-none border-0 ${
            comparisonMode === "round"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Round
        </Button>
        <Button
          onClick={() => onModeChange("cup")}
          variant={comparisonMode === "cup" ? "default" : "ghost"}
          className={`rounded-none border-0 ${
            comparisonMode === "cup"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Cup
        </Button>
      </div>
    </div>
  );
}
