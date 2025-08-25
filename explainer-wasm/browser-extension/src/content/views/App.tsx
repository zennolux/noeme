import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import "@/index.css";
import { useEffect, useRef, useState } from "react";
import parse from "html-react-parser";

function App() {
  const [explainer, setExplainer] = useState<Explainer | undefined>();
  const trigger = useRef(null);

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
      (trigger.current as any)?.click();
    }
  }, [explainer]);

  return (
    <Sheet>
      <SheetTrigger asChild ref={trigger}>
        <button></button>
      </SheetTrigger>
      <SheetContent className="font-mono">
        <SheetHeader>
          <SheetTitle className="flex justify-center items-center">
            {explainer?.word}
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <ScrollArea className="w-[99%] h-full">
          {explainer?.sentences.map((item, index) => (
            <div className="mx-2 mt-2 [&:last-child]:mb-20" key={index}>
              <p className="text-gray-100">
                {parse(
                  item.en.replace(
                    new RegExp(`(${explainer.word})`, "gi"),
                    `<span className="font-extrabold text-gray-400 underline underline-offset-2">$1</span>`
                  )
                )}
              </p>
              <p className="text-gray-300">{item.cn}</p>
              {index < explainer.sentences.length - 1 ? (
                <Separator />
              ) : (
                <p className="w-full h-20"></p>
              )}
            </div>
          ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default App;
