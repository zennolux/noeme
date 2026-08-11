import "./index.css";
import "react-image-crop/dist/ReactCrop.css";
import {
  getMonitorScreenshot,
  getScreenshotableMonitors,
} from "tauri-plugin-screenshots-api";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import {
  Button,
  EventTypeEnum,
  setEventTypes,
  startListening,
  stopListening,
} from "tauri-plugin-user-input-api";
import { invoke } from "@tauri-apps/api/core";
import { IoVolumeMediumOutline as VolumeIcon } from "react-icons/io5";
import { Separator } from "./components/ui/separator";
import Typed from "typed.js";
import { ScrollArea } from "./components/ui/scroll-area";

function App() {
  const wordEl = useRef(null);
  const [noeme, setNoeme] = useState<Noeme>();

  async function createScreenshotableWindow() {
    const monitors = await getScreenshotableMonitors();
    const path = await getMonitorScreenshot(monitors[0].id);
    const store = await load("store.json");

    await store.set("path-screenshot", path);
    await store.save();

    const webview = new WebviewWindow("screenshot", {
      title: "noeme-screenshot",
      url: "/screenshot",
      visible: true,
      decorations: false,
      maximized: true,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      devtools: true,
    });

    webview.once("tauri://error", (e) => {
      console.info(e);
    });
  }

  function spell(word: string) {
    new Typed(wordEl.current, {
      strings: [word],
      typeSpeed: 300,
      backSpeed: 0,
      fadeOut: true,
      smartBackspace: false,
      loop: true,
      loopCount: 3,
      cursorChar: "",
    });
  }

  function pronounce(url: string) {
    const audio = new Audio(url);
    audio.play();
  }

  //@ts-ignore
  async function listenGlobalMouseEvent() {
    await setEventTypes([EventTypeEnum.ButtonPress]);

    await startListening(async (event) => {
      console.info(event);

      if (event.button != Button.Left) {
        return;
      }

      const text = await invoke<string>("get_selected_text");

      if (text.length < 1) {
        return;
      }

      console.info(text);

      getWordDetails(text);
    });
  }

  async function getWordDetails(word: string) {
    const wordDetails = await invoke<Noeme>("get_word_details", { word });

    setNoeme(wordDetails);
  }

  useEffect(() => {
    const unlistenScreenshot = listen("shortcut-screenshot", () => {
      createScreenshotableWindow();
    });

    const unlistenOcr = listen<string>("ocr-completed", (event) => {
      getWordDetails(event.payload);
    });

    //listenGlobalMouseEvent();

    return () => {
      stopListening();

      unlistenScreenshot.then((fn) => fn());

      unlistenOcr.then((fn) => fn());
    };
  }, []);

  return (
    <div data-tauri-drag-region className="h-full bg-black select-none">
      <div
        data-tauri-drag-region
        className="h-full select-none backdrop-blur-md border border-white/5 shadow-2xl text-gray-400"
      >
        {noeme ? (
          <>
            <header
              data-tauri-drag-region
              className="select-none h-[8%] flex flex-col items-center"
            >
              <h1
                ref={wordEl}
                className="flex-1 text-2xl font-bold hover:text-amber-300"
                onClick={() => spell(noeme.word)}
              >
                {noeme?.word}
              </h1>
              <div className="flex-1 flex gap-2 ">
                <p className="text-gray-500">
                  [{noeme?.pronunciation.phonetic_symbol}]
                </p>
                <p className="text-amber-100 hover:text-amber-300">
                  <VolumeIcon
                    className="text-2xl"
                    onClick={() => pronounce(noeme.pronunciation.audio_url)}
                  />
                </p>
              </div>
            </header>
            <Separator className="bg-gray-700" />
            <main className="h-[84%]">
              <ScrollArea className="h-[100%] px-3">
                <div className="mt-2">
                  <h2 className="font-bold text-gray-400">Basic meanings</h2>
                  {noeme.basic_meanings.map((item) => (
                    <dl
                      key={item.attr}
                      className="flex items-center gap-2 mt-2"
                    >
                      <dt className="w-10 h-6 flex justify-center items-center text-gray-400 bg-gray-700">
                        {item.attr}
                      </dt>
                      <dd>{item.value}</dd>
                    </dl>
                  ))}
                </div>
                <div className="mt-4">
                  <h2 className="font-bold text-gray-400">Advanced meanings</h2>
                  {noeme.advanced_meanings.map((item) => (
                    <div key={item.attr} className="mt-2">
                      <p className=" w-10 h-6 flex justify-center items-center text-gray-400 bg-gray-700">
                        {item.attr}
                      </p>
                      {item.values.map((value, index) => (
                        <>
                          <dl
                            key={index}
                            className="flex items-center gap-4 mt-2"
                          >
                            <dt className="text-gray-500 font-bold">
                              {index + 1}.
                            </dt>
                            <dd>
                              <p>{value.en}</p>
                              <p className="mt-2">{value.cn}</p>
                            </dd>
                          </dl>
                          {index < item.values.length - 1 ? (
                            <Separator className="mt-2 bg-gray-800" />
                          ) : (
                            ""
                          )}
                        </>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <h2>Sample sentences</h2>
                  {noeme.sentences.map((item, index) => (
                    <>
                      <dl key={index} className="flex items-center gap-4 mt-2">
                        <dt className="text-gray-500 font-bold">
                          {index + 1}.
                        </dt>
                        <dd>
                          <p>{item.en}</p>
                          <p className="mt-2">{item.cn}</p>
                        </dd>
                      </dl>
                      {index < noeme.sentences.length - 1 ? (
                        <Separator className="mt-2 bg-gray-800" />
                      ) : (
                        ""
                      )}
                    </>
                  ))}
                </div>
              </ScrollArea>
            </main>
          </>
        ) : (
          <div className="data-tauri-drag-region h-full flex justify-center items-center">
            No data yet...
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
