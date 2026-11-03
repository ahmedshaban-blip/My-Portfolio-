import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CV_CONFIG, type CVTrack } from "@/config/cv";
import { CV_TRACKS } from "@/lib/cv-view";
import { cn } from "@/lib/utils";

type CVTrackTabsProps = {
  track: CVTrack;
  onChange: (next: CVTrack) => void;
  className?: string;
};

/**
 * Switches between the two CV variants. There is no `TabsContent` — the shared
 * viewer renders the selected document — so this is used purely as a controlled
 * value with keyboard support from Radix.
 */
export function CVTrackTabs({ track, onChange, className }: CVTrackTabsProps) {
  return (
    <Tabs
      value={track}
      onValueChange={(next) => onChange(next as CVTrack)}
      className={cn("w-full sm:w-auto", className)}
    >
      <TabsList className="h-auto w-full justify-start gap-1 rounded-full p-1 sm:w-auto">
        {CV_TRACKS.map((option) => (
          <TabsTrigger
            key={option}
            value={option}
            className="flex-1 rounded-full px-4 py-2 text-sm font-semibold sm:flex-none"
          >
            {CV_CONFIG[option].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
