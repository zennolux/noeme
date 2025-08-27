import init, { explain } from "../../pkg/explainer_wasm.js";

//https://chat.deepseek.com/a/chat/s/355dc451-564f-4eea-a11c-69b37d3ca603

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
