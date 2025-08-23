import init, { explain } from "../../pkg/explainer_wasm.js";

chrome.runtime.onMessage.addListener((word, _sender, sendResponse) => {
  (async () => {
    await init();

    try {
      sendResponse(await explain(word));
    } catch (error) {
      sendResponse(undefined);
    }
  })();

  return true;
});
