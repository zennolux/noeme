import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import parse from "html-react-parser";

function App() {
  const [explainer, setExplainer] = useState<Explainer | undefined>();
  const [openSheet, setOpenSheet] = useState(false);

  useEffect(() => {
    window.document.documentElement.classList.add("dark");

    document.addEventListener("dblclick", () => {
      const word = window.getSelection()?.toString().trim();

      if (!word || word?.length < 1) {
        return;
      }

      if (!/^[a-zA-Z]{2,}$/.test(word)) {
        return;
      }

      chrome.runtime.sendMessage(word, (response) => {
        setExplainer(response as Explainer | undefined);
      });
    });
  }, []);

  useEffect(() => {
    console.info(explainer);
    if (explainer) {
      setOpenSheet(true);
    }
  }, [explainer]);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent className="h-full font-mono">
        <SheetHeader className="h-[5%]">
          <SheetTitle className="flex justify-center items-center">
            {explainer?.word}
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <ScrollArea className="w-[99%] h-[90%]">
          {explainer?.sentences.map((item, index) => (
            <div className="mx-2 mt-2 [&:last-child]:mb-20" key={index}>
              <div className="flex gap-2 items-start">
                <h4 className="text-gray-500">{index + 1}.</h4>
                <div>
                  <p className="text-gray-200">
                    {parse(
                      item.en.replace(
                        new RegExp(`(${explainer.word})`, "gi"),
                        `<span className="font-extrabold text-gray-100 underline underline-offset-4">$1</span>`
                      )
                    )}
                  </p>
                  <p className="text-gray-200">{item.cn}</p>
                </div>
              </div>
              {index < explainer.sentences.length - 1 ? <Separator /> : ""}
            </div>
          ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <SheetFooter className="h-[5%] w-full"></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default App;
