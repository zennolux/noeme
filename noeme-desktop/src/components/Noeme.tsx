import "@/index.css";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import {
  IoIosCloseCircleOutline as IconClose,
  IoMdArrowBack as IconBack,
} from "react-icons/io";
import { name, version } from "@/../package.json";
import {
  getMonitorScreenshot,
  getScreenshotableMonitors,
} from "tauri-plugin-screenshots-api";
import {
  Button,
  EventTypeEnum,
  setEventTypes,
  startListening,
  stopListening,
} from "tauri-plugin-user-input-api";
import { Outlet, useLocation } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Noeme() {
  const win = getCurrentWebviewWindow();
  const [recognizedWord, setRecognizedWord] = useState<Noeme["word"]>();
  const location = useLocation();

  async function createScreenshotableWindow() {
    const monitors = await getScreenshotableMonitors();
    await getMonitorScreenshot(monitors[0].id);

    new WebviewWindow("screenshot", {
      title: "noeme-screenshot",
      url: "/screenshot",
      visible: false,
      decorations: false,
      maximized: true,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      devtools: true,
    });
  }

  async function listenGlobalMouseEvent() {
    await setEventTypes([EventTypeEnum.ButtonPress]);

    await startListening(async (event) => {
      if (event.button != Button.Left) {
        return;
      }

      const text = await invoke<string>("get_selected_text");
      const word = text.replace(/[^a-zA-Z]/g, " ").split(" ")[0];

      if (word.length < 1) {
        return;
      }

      setRecognizedWord(word);
    });
  }

  useEffect(() => {
    if (!recognizedWord) {
      return;
    }
    emit("word-recognized", recognizedWord);
  }, [recognizedWord]);

  useEffect(() => {
    listenGlobalMouseEvent();

    const unlistenHotkeyPressed = listen<
      "Screenshot" | "ToggleWindowVisibleState"
    >("hotkey-pressed", (event) => {
      switch (event.payload) {
        case "Screenshot":
          createScreenshotableWindow();
          break;

        case "ToggleWindowVisibleState":
          win.isVisible().then((visible) => {
            visible ? win.hide() : win.show();
          });
          break;

        default:
          break;
      }
    });

    const unlistenOcrRecognized = listen<Noeme["word"]>(
      "ocr-recognized",
      (event) => {
        setRecognizedWord(event.payload);
      }
    );

    return () => {
      stopListening();

      unlistenHotkeyPressed.then((fn) => fn());
      unlistenOcrRecognized.then((fn) => fn());
    };
  }, []);

  return (
    <TooltipProvider>
      <div
        data-tauri-drag-region
        className="h-full bg-gray-900 backdrop-blur-md border border-white/5 shadow-2xl text-gray-400"
      >
        {location.pathname.startsWith("/details") && (
          <IconBack
            onClick={() => window.location.replace("/")}
            className="absolute -top-[0.15rem] -left-[0.15rem] text-2xl text-gray-500 hover:text-gray-300"
          />
        )}
        <IconClose
          title="Close the window"
          className="absolute -top-[0.15rem] -right-[0.15rem] text-2xl text-gray-500 hover:text-gray-300"
          onClick={() => win.close()}
        />
        <Outlet />
        <footer className="absolute bottom-[2%] left-1/2 -translate-x-1/2">
          <a
            title="Visit offical website"
            href="https://github.com/zennolux/noeme"
            target="_blank"
            className="underline underline-offset-4 text-gray-500 hover:text-amber-100"
          >
            {" "}
            {`${name} v${version}`}
          </a>
        </footer>
      </div>
    </TooltipProvider>
  );
}
