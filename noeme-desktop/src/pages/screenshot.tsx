import { useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
//import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createWorker } from "tesseract.js";

export default function Screenshot() {
  const [imgurl, setImgUrl] = useState<string | undefined>();
  const [crop, setCrop] = useState<Crop>();
  const imgref = useRef(null);

  async function getFullScreenImage() {
    const store = await load("store.json");
    const path = await store.get<string>("path-screenshot");

    setImgUrl(convertFileSrc(path!));
  }

  async function saveCropedImage() {
    //const win = getCurrentWebviewWindow();

    const { clientWidth, clientHeight, naturalWidth, naturalHeight } =
      imgref.current as unknown as HTMLImageElement;

    const [scaleX, scaleY] = [
      naturalWidth / clientWidth,
      naturalHeight / clientHeight,
    ];

    const imageArea = {
      x: crop!.x * scaleX,
      y: crop!.y * scaleY,
      width: crop!.width * scaleX,
      height: crop!.height * scaleY,
    };

    const path = (await invoke("crop_image", { imageArea })) as string;

    console.info(path);
    const url = convertFileSrc(path);

    const worker = await createWorker("eng");
    const { data } = await worker.recognize(url);

    console.info("#####", data.text);

    worker.terminate();

    setTimeout(() => {
      //win.close();
    }, 0);
  }

  useEffect(() => {
    getFullScreenImage();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {imgurl ? (
        <>
          <ReactCrop crop={crop} onChange={(crop) => setCrop(crop)}>
            <img ref={imgref} style={{ margin: 0, padding: 0 }} src={imgurl} />
          </ReactCrop>
          <button
            onClick={saveCropedImage}
            draggable={true}
            style={{
              position: "absolute",
              top: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              width: "10rem",
              height: "2rem",
              background: "black",
              opacity: 0.2,
              borderRadius: "1rem",
            }}
          >
            保存
          </button>
        </>
      ) : (
        "Loading..."
      )}
    </div>
  );
}
