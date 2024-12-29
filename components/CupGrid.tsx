'use client';
import { Cup } from '@/app/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const pulsingBorderKeyframes = `
  @keyframes pulse-border {
    0%, 100% {
      box-shadow: 0 0 0 0px rgba(255, 0, 0, 0.7);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.7);
    }.
  }
`;

const PulsingBorderStyle = () => (
  <style jsx global>{`
    ${pulsingBorderKeyframes}
    .animate-pulse-border {
      animation: pulse-border 2s infinite;
    }
  `}</style>
);

interface CupGridProps {
  cups: Cup[];
  isResetDialogOpen: boolean;
  setIsResetDialogOpen: (isOpen: boolean) => void;
  cupToReset: Cup | null;
  isResetCupDialogOpen: boolean;
  setIsResetCupDialogOpen: (isOpen: boolean) => void;
  cupToAssign: Cup | null;
  isAssignCupDialogOpen: boolean;
  setIsAssignCupDialogOpen: (isOpen: boolean) => void;
  selectRandomCup: () => void;
  toggleCup: (cup: Cup) => void;
  confirmAssignCup: () => void;
  confirmResetCup: () => void;
  resetAllCups: () => void;
}

export function CupGrid({
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
}: CupGridProps) {
  const maxRound = Math.max(...cups.map(cup => cup.round || 0))

  return (
    <>
      <PulsingBorderStyle />
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-3xl font-bold mb-4 text-center">Cups</h2>
        <div className="flex justify-center mb-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={selectRandomCup}
                  className="text-xl py-3 px-6"
                  disabled={cups.every(cup => cup.round !== null)}
                >
                  Select Random Cup
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{cups.every(cup => cup.round !== null) ? 'All cups have been played' : 'Select a random unplayed cup'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-6 gap-4 mb-8">
              {cups.map((cup) => {
                const isPlayed = cup.round !== null;
                const isActive = cup.round === maxRound;
                return (
                  <TooltipProvider key={cup.cup}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer
                            ${isPlayed ? 'bg-white' : 'bg-gray-200 opacity-50'}
                            ${isActive ? 'animate-pulse-border' : ''}
                          `}
                          onClick={() => toggleCup(cup)}
                        >
                          <span className="text-4xl mb-2">{cup.icon}</span>
                          <span className="text-center text-sm">{cup.name}</span>
                          {isPlayed && <span className="text-xs mt-1">Round {cup.round}</span>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isPlayed && cup.round !== maxRound
                          ? "This cup can't be removed because it has scores associated with it."
                          : isPlayed
                          ? "Click to mark as unplayed"
                          : "Click to assign to next round"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-xl py-3 px-6">
                Reset All Cups
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Reset All Cups</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reset all cups? This action cannot be undone.
                  <span className="block mt-2 font-bold text-yellow-600">
                    Warning: This action will reset the cups for all users.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                <Button onClick={resetAllCups}>Confirm Reset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Dialog open={isResetCupDialogOpen} onOpenChange={setIsResetCupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Cup</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the {cupToReset?.name}?
              <span className="block mt-2 font-bold text-yellow-600">
                Warning: This action will change the cup status for all users.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetCupDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmResetCup}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAssignCupDialogOpen} onOpenChange={setIsAssignCupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Cup</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign the {cupToAssign?.name} to the next round?
              <span className="block mt-2 font-bold text-yellow-600">
                Warning: This action will change the cup status for all users.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignCupDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAssignCup}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

