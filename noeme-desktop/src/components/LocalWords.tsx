import { useEffect, useState } from "react";
import { getLocalWords, type LocalWord, MarkKind } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";

export default function LocalWords() {
  const [mark, setMark] = useState<MarkKind>(MarkKind.New);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Array<LocalWord>>();

  async function setLocalWords(mark: MarkKind) {
    const { total, data } = await getLocalWords(mark);

    setTotal(total);
    setData(data);
  }

  useEffect(() => {
    setLocalWords(mark);
  }, [mark]);

  return (
    <TooltipProvider>
      <header
        data-tauri-drag-region
        className="select-none w-full h-[8%] font-bold flex items-center justify-between px-4"
      >
        {[
          {
            name: "New",
            description: "Never seen before.",
            value: MarkKind.New,
          },
          {
            name: "Unsure",
            description: "Vaguely familiar, needs practice.",
            value: MarkKind.Unsure,
          },
          {
            name: "Mastered",
            description: "Known inside out",
            value: MarkKind.Mastered,
          },
        ].map((item) => (
          <Tooltip key={item.value}>
            <TooltipTrigger
              render={
                <p
                  title={item.description}
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
                <p>Total: {total}</p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </header>
      <Separator className="bg-gray-700" />
      <main className="h-[84%] select-none">
        <ScrollArea className="h-full px-3" key={data?.length}>
          {data?.map((item, index) => (
            <>
              <div key={index} className="my-4">
                <div className="flex justify-between items-center">
                  <div className="w-[70%]">
                    <p className="text-gray-300">{item.name}</p>
                    <p className="">{item.meaning}</p>
                  </div>
                  <div className="w-[30%]">
                    <p className="text-gray-600 text-right">
                      {item.created_at.split(" ")[0]}
                    </p>
                  </div>
                </div>
              </div>
              {index < data.length - 1 && (
                <Separator className="mt-2 bg-gray-800" />
              )}
            </>
          ))}
        </ScrollArea>
      </main>
    </TooltipProvider>
  );
}
