import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { CgDetailsMore as IconDetails } from "react-icons/cg";
import { MdClose as IconClose } from "react-icons/md";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export default function Spelling() {
  const win = getCurrentWebviewWindow();
  const el = useRef(null);
  const [word, setWord] = useState<Noeme["word"]>();

  useEffect(() => {
    if (!el.current || !word) {
      return;
    }
    const typed = new Typed(el.current, {
      strings: [word!],
      typeSpeed: 700,
      loop: true,
    });

    return () => typed.destroy();
  }, [el.current, word]);

  useEffect(() => {
    setWord("incredible");
  }, []);

  return (
    <div data-tauri-drag-region className="size-full relative">
      <div
        data-tauri-drag-region
        ref={el}
        className="size-full flex items-center justify-center text-3xl text-amber-200"
      ></div>
      <div className="text-2xl absolute top-1/2 -translate-y-1/2 right-1 ">
        <div className="flex gap-2">
          <IconDetails className="cursor-pointer text-gray-400 hover:text-gray-200" />
          <IconClose
            className="cursor-pointer text-gray-400 hover:text-gray-200"
            onClick={() => win.close()}
          />
        </div>
      </div>
    </div>
  );
}
