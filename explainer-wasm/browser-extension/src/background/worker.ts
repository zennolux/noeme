import init, { explain } from "../../pkg/explainer_wasm.js";

chrome.runtime.onMessage.addListener((word, _sender, sendResponse) => {
  (async () => {
    const cached = await chrome.storage.local.get(word);

    if (cached[word]) {
      sendResponse(cached[word]);
    } else {
      await init();

      try {
        const explainer = await explain(word);

        sendResponse(explainer);

        await chrome.storage.local.set({ [word]: explainer });
      } catch (error) {
        sendResponse(undefined);
      }
    }
  })();

  return true;
});
