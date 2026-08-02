import { useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createWorker } from "tesseract.js";

export default function Screenshot() {
  const [imgurl, setImgUrl] = useState<string | undefined>();
  const [crop, setCrop] = useState<Crop>();
  const imgref = useRef(null);
  const currentWindow = getCurrentWebviewWindow();

  async function getFullScreenImage() {
    const store = await load("store.json");
    const path = await store.get<string>("path-screenshot");

    setImgUrl(convertFileSrc(path!));
  }

  async function saveCropedImage() {
    if (!crop) {
      return;
    }

    const { clientWidth, clientHeight, naturalWidth, naturalHeight } =
      imgref.current as unknown as HTMLImageElement;

    const [scaleX, scaleY] = [
      naturalWidth / clientWidth,
      naturalHeight / clientHeight,
    ];

    const imageArea = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };

    const path = (await invoke("crop_image", { imageArea })) as string;
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(convertFileSrc(path));

    worker.terminate();

    setTimeout(() => {
      currentWindow.emitTo("main", "ocr-completed", data.text);
      currentWindow.close();
    }, 0);
  }

  useEffect(() => {
    getFullScreenImage();

    window.addEventListener("keyup", (event) => {
      if (event.key != "Escape") {
        return;
      }
      currentWindow.close();
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {imgurl ? (
        <ReactCrop
          crop={crop}
          onChange={(crop) => setCrop(crop)}
          onComplete={saveCropedImage}
        >
          <img ref={imgref} style={{ margin: 0, padding: 0 }} src={imgurl} />
        </ReactCrop>
      ) : (
        "Loading..."
      )}
    </div>
  );
}
