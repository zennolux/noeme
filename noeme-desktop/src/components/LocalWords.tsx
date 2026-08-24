import { useEffect, useState } from "react";
import { MarkKind } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LocalWords() {
  const [mark, setMark] = useState<MarkKind>(MarkKind.Fresh);

  useEffect(() => {
    console.info(mark);
  }, [mark]);

  return (
    <TooltipProvider>
      <header
        data-tauri-drag-region
        className="select-none w-full h-[8%] font-bold flex items-center justify-between px-4"
      >
        {[
          { name: "Fresh", value: MarkKind.Fresh },
          { name: "Maybe", value: MarkKind.Maybe },
          { name: "Mastered", value: MarkKind.Mastered },
        ].map((item) => (
          <Tooltip key={item.value}>
            <TooltipTrigger
              render={
                <p
                  className={`w-1/4  ${
                    item.value === mark
                      ? "bg-amber-100 text-gray-700"
                      : "bg-gray-200 text-gray-500"
                  } text-center rounded-2xl`}
                  onClick={() => setMark(item.value)}
                >
                  {item.name}
                </p>
              }
            />
            {item.value === mark && (
              <TooltipContent className="bg-gray-200 text-gray-900 opacity-65">
                <p>Total: 1000</p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </header>
      <Separator className="bg-gray-700" />
    </TooltipProvider>
  );
}
