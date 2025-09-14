type Message = {
  type: string;
  target: string;
  data: { [key: string]: string };
};

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.target !== "offscreen") {
      return false;
    }

    const audio = new Audio(message.data.url);
    audio.play();
    sendResponse({ startPlay: true });

    audio.addEventListener("ended", () => {
      chrome.runtime.sendMessage({
        type: "AUDIO_COMPLETED_TO_PLAY",
        target: "background",
        data: { ended: true, url: message.data.url },
      });
    });
  }
);
