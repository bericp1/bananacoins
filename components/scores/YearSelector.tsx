"use client";
import { Button } from "@/components/ui/button";

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearSelector({
  availableYears,
  selectedYear,
  onYearChange,
}: YearSelectorProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center gap-2">
          {availableYears.map((yr) => (
            <Button
              key={yr}
              onClick={() => onYearChange(yr)}
              variant={selectedYear === yr ? "default" : "outline"}
              className={selectedYear === yr ? "font-bold" : ""}
              size="lg"
            >
              {yr}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
