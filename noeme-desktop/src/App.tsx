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
//import { Separator } from "./components/ui/separator";

function App() {
  const [ocrText, setOcrText] = useState("");
  const [selectedText, setSelectedText] = useState("");
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

      setSelectedText(text);
    });
  }

  async function getWordDetails(word: string) {
    const wordDetails = await invoke<Noeme>("get_word_details", { word });

    setNoeme(wordDetails);
  }

  useEffect(() => {
    listen("shortcut-screenshot", () => {
      createScreenshotableWindow();
    });

    listen<string>("ocr-completed", (event) => {
      setOcrText(event.payload);
      getWordDetails(event.payload);
    });

    listenGlobalMouseEvent();

    return () => {
      stopListening();
    };
  }, []);

  return (
    <main className="bg-black h-full text-gray-400">
      {noeme ? (
        <>
          <header className="h-16 flex flex-col items-center">
            <h1 className="text-2xl font-bold">{noeme?.word}</h1>
            <div className="flex gap-2 ">
              <p className="text-gray-500">
                US[{noeme?.pronunciation.phonetic_symbol.trim()}]
              </p>
              <p className="text-amber-100 hover:text-amber-300">
                <VolumeIcon className="text-2xl" />
              </p>
            </div>
          </header>
        </>
      ) : (
        <div className="h-full flex justify-center items-center">
          No data yet...
        </div>
      )}
    </main>
  );
}

export default App;
