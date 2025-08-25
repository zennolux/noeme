import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import "@/index.css";
import { useEffect, useRef, useState } from "react";

function App() {
  const [explainer, setExplainer] = useState<Explainer | undefined>();
  const [mousePosition, setMousePositon] = useState({ pageX: 0, pageY: 0 });
  const popupTrigger = useRef(null);

  useEffect(() => {
    document.addEventListener("dblclick", (event) => {
      const word = window.getSelection()?.toString().trim();
      const { pageX, pageY } = event;

      if (!word || word?.length < 1) {
        return;
      }

      if (!/^[a-zA-Z]{2,}$/.test(word)) {
        return;
      }

      setMousePositon({ pageX, pageY });

      chrome.runtime.sendMessage(word, (response) => {
        setExplainer(response as Explainer | undefined);
      });
    });
  }, []);

  useEffect(() => {
    console.info(explainer);
    if (explainer) {
      (popupTrigger.current as any)?.click();
    }
  }, [explainer]);

  return (
    <Popover>
      <PopoverTrigger
        className="btn-trigger fixed w-20 h-0 z-50 opacity-0"
        style={{
          top: `${mousePosition.pageY + 10}px`,
          left: `${mousePosition.pageX - 40}px`,
        }}
        ref={popupTrigger}
      ></PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  );
}

export default App;
