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
import { IoVolumeMediumOutline as Volume } from "react-icons/io5";
import { type Explainer } from "@zennolux/explainer-wasm";

function App() {
  const [explainer, setExplainer] = useState<Explainer | undefined>();
  const [openSheet, setOpenSheet] = useState(false);

  /*
  chrome.tabs.onUpdated.addListener((info) => {
    console.info(info);

    const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    console.info(theme);
  });

  /*
	// In your content script
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

// Listen for theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const newTheme = e.matches ? 'dark' : 'light';
  console.log('Theme changed to:', newTheme);
});

	*/

  const playAudio = (url: string) => {
    chrome.runtime.sendMessage({
      type: "PLAY_AUDIO",
      target: "background",
      data: { url },
    });
  };

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

      chrome.runtime.sendMessage(
        { type: "FETCH_EXPLAINED_DATA", target: "background", data: { word } },
        (response: Explainer | undefined) => {
          setExplainer(response);
        }
      );
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
      <SheetContent className="h-full font-mono z-50">
        <SheetHeader className="h-[12%]">
          <SheetTitle className="flex justify-center items-center">
            {explainer?.word}
          </SheetTitle>
          <SheetDescription className="mt-2 flex justify-center items-center gap-2">
            <p>[{explainer?.pronunciation.phonetic_symbol}]</p>
            <p>
              <Volume
                className="text-2xl hover:text-gray-300"
                onClick={() => playAudio(explainer?.pronunciation.audio_url!)}
              />
            </p>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="w-[99%] h-[78%]">
          <div className="mt-2 mx-2">
            <h4 className="text-gray-200">Basic Meanings:</h4>
            {explainer?.basic_meanings.map((item) => (
              <div className="mt-2 flex gap-2">
                <h4 className="flex justify-center items-center text-gray-100 font-extrabold w-15 h-5 bg-gray-800 shadow-background">
                  {item.attr}
                </h4>
                <p className="text-gray-300">{item.value}</p>
              </div>
            ))}
          </div>
          {explainer?.advanced_meanings.length! > 0 && (
            <div className="mt-2 mx-2">
              <h4 className="text-gray-200">Advanced Meanings:</h4>
              {explainer?.advanced_meanings.map((item, index) => (
                <div className="mt-2" key={index}>
                  <div className="flex flex-col gap-2">
                    <h4 className="flex justify-center items-center text-gray-100 font-extrabold w-15 h-5 bg-gray-800 shadow-background">
                      {item.attr}
                    </h4>
                    <div>
                      {item.values.map((value, key) => (
                        <>
                          <div className="flex gap-2 mt-2" key={key}>
                            <h4 className="text-gray-500">{key + 1}.</h4>
                            <div>
                              <p className="text-gray-300">{value.en}</p>
                              <p className="text-gray-300">{value.cn}</p>
                            </div>
                          </div>
                          {key < item.values.length - 1 && <Separator />}
                        </>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {explainer?.sentences.length! > 0 && (
            <div className="mt-2 mx-2">
              <h4 className="text-gray-200">Sample Sentences:</h4>
              {explainer?.sentences.map((item, index) => (
                <div className="mt-2" key={index}>
                  <div className="flex gap-2 items-start">
                    <div className="flex gap-1">
                      <h4 className="text-gray-500">{index + 1}.</h4>
                      <p>
                        <Volume
                          className="text-2xl text-gray-400 hover:text-gray-300"
                          onClick={() => playAudio(item.audio_url)}
                        />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300">
                        {parse(
                          item.en.replace(
                            new RegExp(`(${explainer.word})`, "gi"),
                            `<span className="font-extrabold text-gray-100 underline underline-offset-4">$1</span>`
                          )
                        )}
                      </p>
                      <p className="text-gray-300">{item.cn}</p>
                    </div>
                  </div>
                  {index < explainer.sentences.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <SheetFooter className="h-[10%] w-full"></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default App;
