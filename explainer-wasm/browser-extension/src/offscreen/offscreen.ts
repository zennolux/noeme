type Message = {
  type: string;
  target: string;
  data: { [key: string]: string };
};

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.target !== "offscreen") {
    return false;
  }

  const audio = new Audio(message.data.url);
  audio.play();

  audio.addEventListener("ended", () => {
    chrome.runtime.sendMessage({
      type: "AUDIO_COMPLETED_TO_PLAY",
      target: "background",
      data: true,
    });
  });
});
