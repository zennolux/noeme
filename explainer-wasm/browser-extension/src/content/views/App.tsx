import Logo from "@/assets/crx.svg";
import { useState } from "react";
import "./App.css";
import "@/index.css";
import { explain } from "@zennolux/explainer-wasm";

function App() {
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);

  document.addEventListener("mouseup", async () => {
    const selectedText = window.getSelection()?.toString().trim();

    if (!selectedText || selectedText?.length < 1) {
      return;
    }
    if (!/^[a-zA-Z]{2,}$/.test(selectedText)) {
      return;
    }
    console.info(selectedText);

    const r = await explain(selectedText);
    console.info(r);
  });

  return (
    <div className="popup-container">
      {show && (
        <div className={`popup-content ${show ? "opacity-100" : "opacity-0"}`}>
          <h1 className="text-red-300">HELLO CRXJS</h1>
        </div>
      )}
      <button className="toggle-button" onClick={toggle}>
        <img src={Logo} alt="CRXJS logo" className="button-icon" />
      </button>
    </div>
  );
}

export default App;
