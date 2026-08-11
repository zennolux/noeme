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
import { IoVolumeMediumOutline as IconVolume } from "react-icons/io5";
import { VscRunBelow as IconBelow } from "react-icons/vsc";
import { Separator } from "./components/ui/separator";
import Typed from "typed.js";
import { ScrollArea } from "./components/ui/scroll-area";
import parse from "html-react-parser";

function App() {
  const wordEl = useRef(null);
  const [noeme, setNoeme] = useState<Noeme>();
  const [playing, setPlaying] = useState<{ [key: number]: boolean }>();
  const [showPlayingIcon, setShowPlayingIcon] = useState<{
    [key: number]: boolean;
  }>();

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

  function pronounce(
    url: string,
    onPlaying: Function | undefined = undefined,
    onEnded: Function | undefined = undefined
  ) {
    const audio = new Audio(url);
    audio.play();

    onPlaying &&
      audio.addEventListener("playing", () => {
        onPlaying();
      });

    onEnded &&
      audio.addEventListener("ended", () => {
        onEnded();
      });
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
                className="flex-1 text-2xl font-bold hover:text-amber-100"
                onClick={() => spell(noeme.word)}
              >
                {noeme?.word}
              </h1>
              <div className="flex-1 flex gap-2 ">
                <p>
                  /
                  <i className="text-gray-500">
                    {noeme?.pronunciation.phonetic_symbol}
                  </i>
                  /
                </p>
                <p className="text-amber-100 hover:text-amber-300">
                  <IconVolume
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
                  <div className="flex items-center gap-2">
                    <IconBelow className="text-amber-100" />
                    <h2 className="font-bold text-blue-200">Basic meanings</h2>
                  </div>
                  {noeme.basic_meanings.map((item) => (
                    <dl
                      key={item.attr}
                      className="flex items-center gap-2 mt-2"
                    >
                      <dt className="w-10 h-6 flex justify-center items-center text-gray-400 bg-gray-700">
                        {item.attr}
                      </dt>
                      <dd className="w-[90%]">{item.value}</dd>
                    </dl>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <IconBelow className="text-amber-100" />
                    <h2 className="font-bold text-blue-200">
                      Advanced meanings
                    </h2>
                  </div>
                  {noeme.advanced_meanings.map((item) => (
                    <div key={item.attr} className="mt-2">
                      <p className=" w-10 h-6 flex justify-center items-center text-gray-400 bg-gray-700">
                        {item.attr}
                      </p>
                      {item.values.map((value, index) => (
                        <div key={index}>
                          <dl className="flex items-center gap-4 mt-2">
                            <dt className="w-[5%] text-blue-200 font-bold">
                              {index + 1}.
                            </dt>
                            <dd className="w-[95%]">
                              <p>{value.en}</p>
                              <p className="mt-2">{value.cn}</p>
                            </dd>
                          </dl>
                          {index < item.values.length - 1 ? (
                            <Separator className="mt-2 bg-gray-800" />
                          ) : (
                            ""
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <IconBelow className="text-amber-100" />

                    <h2 className="font-bold text-blue-200">
                      Sample sentences
                    </h2>
                  </div>
                  {noeme.sentences.map((item, index) => (
                    <div key={index}>
                      <dl className="flex items-center gap-4 mt-2">
                        <dt className="w-[5%] text-blue-200 font-bold">
                          {index + 1}.
                        </dt>
                        <dd className="w-[95%]">
                          <p
                            className={`${
                              (showPlayingIcon && showPlayingIcon[index]) ||
                              (playing && playing[index])
                                ? "bg-gray-900 opacity-80"
                                : ""
                            } relative`}
                            onMouseOver={() =>
                              setShowPlayingIcon({ [index]: true })
                            }
                            onMouseLeave={() => {
                              if (!playing || !playing[index]) {
                                setShowPlayingIcon({ [index]: false });
                              }
                            }}
                          >
                            {parse(
                              item.en.replace(
                                noeme.word,
                                `<i className="underline underline-offset-4 text-amber-100">${noeme.word}</i>`
                              )
                            )}
                            {showPlayingIcon && showPlayingIcon[index] ? (
                              <IconVolume
                                className={`text-3xl text-amber-100 z-50 absolute left-1/2 top-1/2 -translate-1/2 ${
                                  playing && playing[index]
                                    ? "animate-ping"
                                    : ""
                                }`}
                                onClick={() => {
                                  setPlaying({ [index]: true });
                                  pronounce(
                                    item.audio_url,
                                    () => setPlaying({ [index]: true }),
                                    () => {
                                      setShowPlayingIcon({ [index]: false });
                                      setPlaying({ [index]: false });
                                    }
                                  );
                                }}
                              />
                            ) : (
                              ""
                            )}
                          </p>
                          <p className="mt-2">{item.cn}</p>
                        </dd>
                      </dl>
                      {index < noeme.sentences.length - 1 ? (
                        <Separator className="mt-2 bg-gray-800" />
                      ) : (
                        ""
                      )}
                    </div>
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
