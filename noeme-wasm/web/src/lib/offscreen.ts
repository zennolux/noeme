const OFFSCREEN_DOCUMENT_PATH = "src/offscreen/offscreen.html";

async function hasDocument() {
  // Check all windows controlled by the service worker if one of them is the offscreen document
  // @ts-ignore-next-line
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_PATH)) {
      return true;
    }
  }
  return false;
}

export async function createDocument() {
  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "play audio",
    });
  }
}

export async function closeDocument() {
  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}
