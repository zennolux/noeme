import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function Screenshot() {
  const [imgurl, setImgUrl] = useState<string | undefined>();
  const [crop, setCrop] = useState<Crop>();

  async function getFullScreenImage() {
    const store = await load("store.json");
    const path = await store.get<string>("path-screenshot");

    setImgUrl(convertFileSrc(path!));
  }

  async function saveCropedImage() {
    const win = getCurrentWebviewWindow();
    console.info(crop);

    const r = await invoke("greet", { imageArea: crop });

    console.info(r);
    setTimeout(() => {
      win.close();
    }, 0);
  }

  //useEffect(() => {
  //  if (!crop || crop.x == 0 || crop.y == 0) {
  //    return;
  //  }
  //  console.info(crop);
  //}, [crop]);

  useEffect(() => {
    getFullScreenImage();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {imgurl ? (
        <>
          <ReactCrop crop={crop} onChange={(crop) => setCrop(crop)}>
            <img style={{ margin: 0, padding: 0 }} src={imgurl} />
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
