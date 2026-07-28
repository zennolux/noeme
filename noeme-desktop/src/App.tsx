//import reactLogo from "./assets/react.svg";
//import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import "react-image-crop/dist/ReactCrop.css";
import {
  getMonitorScreenshot,
  getScreenshotableMonitors,
} from "tauri-plugin-screenshots-api";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

function App() {
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
      devtools: true,
    });

    webview.once("tauri://created", async () => {
      console.info("webview-created");
    });

    webview.once("tauri://error", (e) => {
      console.info(e);
    });
  }

  //const [greetMsg, setGreetMsg] = useState("");
  //const [name, setName] = useState("");

  useEffect(() => {
    listen("shortcut-screenshot", (event) => {
      console.info("triggered", event.payload);

      createScreenshotableWindow();
    });
  }, []);

  //async function greet() {
  //  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //  setGreetMsg(await invoke("greet", { name }));
  //}

  return (
    <>
      <img
        src="/vite.svg"
        className="logo vite"
        style={{ height: "400px", width: "100%" }}
        alt="Vite logo"
      />
    </>
  );
}

export default App;
