//import { invoke } from "@tauri-apps/api/core";
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

function App() {
  const [ocr, setOcr] = useState("");

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

  useEffect(() => {
    listen("shortcut-screenshot", () => {
      createScreenshotableWindow();
    });

    listen("ocr-completed", (event) => {
      setOcr(event.payload as string);
    });
  }, []);

  return <div>{ocr ? <p>Got OCR text: {ocr}</p> : "Ready..."}</div>;
}

export default App;
