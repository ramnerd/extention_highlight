// background.js — handles saving/deleting highlights in chrome.storage.local

async function getHighlights() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ highlights: [] }, (res) => resolve(res.highlights || []));
  });
}

async function setHighlights(highlights) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ highlights }, () => resolve(true));
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message?.type === "saveHighlight") {
      const highlights = await getHighlights();
      highlights.push(message.data);
      await setHighlights(highlights);
      sendResponse({ ok: true });
    } else if (message?.type === "deleteHighlight") {
      const id = message.id;
      const highlights = await getHighlights();
      const filtered = highlights.filter(h => h.id !== id);
      await setHighlights(filtered);
      sendResponse({ ok: true });
    } else if (message?.type === "getHighlights") {
      const highlights = await getHighlights();
      // Return newest first
      highlights.sort((a,b) => b.timestamp - a.timestamp);
      sendResponse({ ok: true, highlights });
    }
  })();

  // Keep the message channel open for async response
  return true;
});
