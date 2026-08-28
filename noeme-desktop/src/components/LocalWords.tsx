import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getLocalWords,
  type LocalWord,
  MarkKind,
  removeWord,
  updateWordMark,
} from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CgDetailsMore as IconDetails } from "react-icons/cg";
import { FaMarker as IconMarker } from "react-icons/fa";
import { RiDeleteRow as IconDelete } from "react-icons/ri";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NoemeChild } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function LocalWords({
  setWord,
  setChild: setChild,
}: {
  setWord: Dispatch<
    SetStateAction<
      { value: Noeme["word"]; shouldSaveToLocal: boolean } | undefined
    >
  >;
  setChild: Dispatch<SetStateAction<NoemeChild | undefined>>;
}) {
  const [mark, setMark] = useState<MarkKind>(MarkKind.New);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Array<LocalWord>>();
  const [hoverThis, setHoverThis] = useState<number>();

  async function setLocalWords(mark: MarkKind) {
    const { total, data } = await getLocalWords(mark);

    setTotal(total);
    setData(data);
  }

  async function markSpecificWord(id: number, markAs: MarkKind) {
    await updateWordMark(id, markAs);

    setLocalWords(mark);
  }

  async function removeSpecificWord(id: number) {
    await removeWord(id);

    setLocalWords(mark);
  }

  function viewWordDetails(word: Noeme["word"]) {
    setWord({ value: word, shouldSaveToLocal: false });
    setChild(NoemeChild.WordDetails);
  }

  useEffect(() => {
    setLocalWords(mark);
  }, [mark]);

  return (
    <>
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
            <div key={index}>
              <div
                className="relative min-h-16 my-4 hover:bg-gray-700 hover:opacity-70"
                onMouseOver={() => setHoverThis(index)}
                onMouseLeave={() => setHoverThis(undefined)}
              >
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
                {hoverThis === index && (
                  <div className="absolute top-1/2 left-1/2 -translate-1/2 z-50">
                    <div className="flex justify-center items-center gap-4 border-gray-200 rounded">
                      <IconDetails
                        className="text-2xl text-amber-200 cursor-pointer"
                        title="View details"
                        onClick={() => viewWordDetails(item.name)}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger
                          nativeButton={false}
                          render={
                            <IconDelete
                              className="text-2xl text-red-200 cursor-pointer"
                              title="Delete this one"
                            />
                          }
                        />
                        <AlertDialogContent className="bg-gray-300">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-gray-700"
                              onClick={() => removeSpecificWord(item.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <IconMarker
                              className="text-blue-200 cursor-pointer"
                              title="Mark"
                            />
                          }
                        />
                        <TooltipContent
                          className="bg-gray-200 text-gray-900 opacity-65"
                          side="right"
                        >
                          <RadioGroup
                            onValueChange={(value: MarkKind) =>
                              markSpecificWord(item.id, value)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem
                                title="Mark as `Unsure`"
                                className="bg-gray-600"
                                value={MarkKind.Unsure}
                                id="mark-unsure"
                              />
                              <Label htmlFor="mark-unsure">Unsure</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem
                                title="Mark as `Mastered`"
                                className="bg-gray-600"
                                value={MarkKind.Mastered}
                                id="mark-mastered"
                              />
                              <Label htmlFor="mark-mastered">Mastered</Label>
                            </div>
                          </RadioGroup>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
              {index < data.length - 1 && (
                <Separator className="mt-2 bg-gray-800" />
              )}
            </div>
          ))}
        </ScrollArea>
      </main>
    </>
  );
}
