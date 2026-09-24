import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { CgDetailsMore as IconDetails } from "react-icons/cg";
import { MdClose as IconClose } from "react-icons/md";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emit } from "@tauri-apps/api/event";
import { getLocalWords, MarkKind, type LocalWord } from "@/lib/db";

export default function Spelling() {
  const win = getCurrentWebviewWindow();
  const el = useRef(null);
  const [words, setWords] = useState<Array<LocalWord>>();
  const [currentWord, setCurrentWord] = useState<Noeme["word"]>();

  async function getNewWords() {
    const { data } = await getLocalWords(MarkKind.New);

    setWords(data);
  }

  useEffect(() => {
    if (!el.current || !currentWord) {
      return;
    }
    const typed = new Typed(el.current, {
      strings: [currentWord!],
      typeSpeed: 600,
      loop: true,
    });

    return () => typed.destroy();
  }, [el.current, currentWord]);

  useEffect(() => {
    if (!words || words.length < 1) {
      return;
    }

    let idx = 0;
    setCurrentWord(words[idx].name);

    const timer = setInterval(() => {
      if (idx >= words.length) {
        idx = 0;
      } else {
        idx++;
      }

      setCurrentWord(words[idx].name);

      return () => clearInterval(timer);
    }, 1000 * 60 * 5);
  }, [words]);

  useEffect(() => {
    getNewWords();
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
          <IconDetails
            className="cursor-pointer text-gray-400 hover:text-gray-200"
            onClick={() => emit("word-recognized", currentWord)}
          />
          <IconClose
            className="cursor-pointer text-gray-400 hover:text-gray-200"
            onClick={() => win.close()}
          />
        </div>
      </div>
    </div>
  );
}
