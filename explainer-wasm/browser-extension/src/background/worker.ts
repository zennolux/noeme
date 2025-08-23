import init, { explain } from "../../pkg/explainer_wasm.js";

chrome.runtime.onMessage.addListener((word, _sender, sendResponse) => {
  (async () => {
    await init();

    sendResponse(await explain(word));
  })();

  return true;
});
