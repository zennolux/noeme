import { useEffect, useState } from "react";
//import reactLogo from "./assets/react.svg";
//import { invoke } from "@tauri-apps/api/core";
//import "./App.css";
import "react-image-crop/dist/ReactCrop.css";

//import {
//  getMonitorScreenshot,
//  getScreenshotableMonitors,
//} from "tauri-plugin-screenshots-api";
import ReactCrop, { type Crop } from "react-image-crop";
import {
  getCurrentWebviewWindow,
  WebviewWindow,
} from "@tauri-apps/api/webviewWindow";
import { currentMonitor } from "@tauri-apps/api/window";
import { webview } from "@tauri-apps/api";

function App() {
  async function createScreenshotableWindow() {
    const monitor = await currentMonitor();

    if (!monitor) {
      return;
    }

    console.info(monitor);

    //const currentWindow = getCurrentWebviewWindow();
    //await currentWindow.hide();

    const webview = new WebviewWindow("screenshot", {
      url: "https://google.com",
      visible: true,
    });

    //webview.setPosition(monitor?.position);
    //webview.setSize(monitor?.size);
    //webview.show();

    webview.once("tauri://created", () => {
      console.info("webview-created");
    });

    webview.once("tauri://error", (e) => {
      console.info(e);
    });
  }

  //const [greetMsg, setGreetMsg] = useState("");
  //const [name, setName] = useState("");

  const [crop, setCrop] = useState<Crop>();

  //async function screenshot() {
  //  const monitors = await getScreenshotableMonitors();
  //  const path = await getMonitorScreenshot(monitors[0].id);
  //  console.info(path);
  //}

  //async function greet() {
  //  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //  setGreetMsg(await invoke("greet", { name }));
  //}

  useEffect(() => {
    if (!crop) {
      return;
    }
    console.info(crop);
  }, [crop]);

  return (
    <>
      <ReactCrop crop={crop} onChange={(crop) => setCrop(crop)}>
        <img
          src="/vite.svg"
          className="logo vite"
          style={{ height: "400px", width: "100%" }}
          alt="Vite logo"
        />
      </ReactCrop>
      <button onClick={createScreenshotableWindow}>截图</button>
    </>
  );
}

export default App;
