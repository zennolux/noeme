import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import "@/index.css";
import { useEffect, useState } from "react";

function App() {
  const [explainer, setExplainer] = useState<Explainer | undefined>();

  useEffect(() => {
    document.addEventListener("dblclick", (event) => {
      console.info(event);

      const word = window.getSelection()?.toString().trim();
      const { pageX, pageY } = event;

      if (!word || word?.length < 1) {
        return;
      }

      if (!/^[a-zA-Z]{2,}$/.test(word)) {
        return;
      }

      chrome.runtime.sendMessage(word, (response) => {
        setExplainer(response as Explainer | undefined);

        console.info("use new", pageX, pageY);
      });
    });
  }, []);

  useEffect(() => {
    console.info(explainer);
  }, [explainer]);

  return (
    <div className="h-80 w-80 flex justify-center items-center">
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="h-full w-full">
          Place content for the popover here.
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default App;
