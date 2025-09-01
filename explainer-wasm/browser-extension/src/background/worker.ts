import init, { explain, type Explainer } from "@zennolux/explainer-wasm";
import { closeDocument, createDocument } from "@/lib/offscreen";

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (!changeInfo.url || changeInfo.url.startsWith("chrome://")) {
    return;
  }
  console.log(`@@@Tab: URL changed to ${changeInfo.url}`, changeInfo);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    const { type, target, data } = message;

    if (target != "background") {
      return;
    }

    switch (type) {
      case "FETCH_EXPLAINED_DATA":
        await fetchExplainedData(data.word, sendResponse);
        break;
      case "PLAY_AUDIO":
        await playAudio(data.url, sendResponse);
        break;
      case "AUDIO_COMPLETED_TO_PLAY":
        await closeDocument();
        break;
      default:
        throw new Error(`Unexpected message type: ${type}`);
    }
  })();

  return true;
});

async function fetchExplainedData(
  word: string,
  sendResponse: (response: Explainer | undefined) => void
) {
  const cached = await chrome.storage.local.get(word);

  if (cached[word]) {
    sendResponse(cached[word]);
  } else {
    try {
      await init();

      const explainer = await explain(word);

      sendResponse(explainer);
      await chrome.storage.local.set({ [word]: explainer });
    } catch (error) {
      sendResponse(undefined);
    }
  }
}

async function playAudio(url: string, sendResponse: CallableFunction) {
  await createDocument();

  chrome.runtime
    .sendMessage({
      type: "PLAY_AUDIO",
      target: "offscreen",
      data: { url },
    })
    .catch((error) => {
      throw new Error(error);
    });

  sendResponse(true);
}
