import "./App.css";
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
  setEventTypes,
  startListening,
  stopListening,
} from "tauri-plugin-user-input-api";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [ocrText, setOcrText] = useState("");
  const [selectedText, setSelectedText] = useState("");

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
    await setEventTypes(["ButtonRelease"] as any);

    await startListening(async (event) => {
      console.info(event);

      if ((event.button as any) != "Left") {
        return;
      }

      const text = (await invoke("get_selected_text")) as string;

      if (text.length < 1) {
        return;
      }

      console.info(text);

      setSelectedText(text);
    });
  }

  useEffect(() => {
    listen("shortcut-screenshot", () => {
      createScreenshotableWindow();
    });

    listen("ocr-completed", (event) => {
      setOcrText(event.payload as string);
    });

    listenGlobalMouseEvent();

    return () => {
      stopListening();
    };
  }, []);

  return (
    <div>
      {ocrText ? (
        <p>Got OCR text: {ocrText}</p>
      ) : selectedText ? (
        <p>Got Selected text: {selectedText}</p>
      ) : (
        "Ready..."
      )}
    </div>
  );
}

export default App;
