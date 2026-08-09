import "./index.css";
import "react-image-crop/dist/ReactCrop.css";
import {
  getMonitorScreenshot,
  getScreenshotableMonitors,
} from "tauri-plugin-screenshots-api";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
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

function App() {
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
        className="h-full select-none bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl text-gray-400"
      >
        {noeme ? (
          <>
            <header
              data-tauri-drag-region
              className="select-none h-16 flex flex-col items-center"
            >
              <h1 className="text-2xl font-bold">{noeme?.word}</h1>
              <div className="flex gap-2 ">
                <p className="text-gray-500">
                  US[{noeme?.pronunciation.phonetic_symbol}]
                </p>
                <p className="text-amber-100 hover:text-amber-300">
                  <VolumeIcon className="text-2xl" />
                </p>
              </div>
            </header>
            <Separator className="bg-gray-800" />
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
