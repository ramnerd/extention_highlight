(() => {
  const BUBBLE_ID = "__quick_highlighter_bubble__";
  let bubbleEl = null;
  let lastSelection = "";

  function createBubble() {
    bubbleEl = document.createElement("div");
    bubbleEl.id = BUBBLE_ID;
    bubbleEl.className = "quick-highlighter-bubble quick-highlighter-hidden";

    const label = document.createElement("span");
    label.className = "status";
    label.textContent = "Save highlight?";

    const btn = document.createElement("button");
    btn.textContent = "Save";
    btn.addEventListener("click", onSave);

    bubbleEl.appendChild(label);
    bubbleEl.appendChild(btn);
    document.documentElement.appendChild(bubbleEl);
  }

  function hideBubble() {
    if (bubbleEl) bubbleEl.classList.add("quick-highlighter-hidden");
  }

  function showBubbleAt(x, y) {
    if (!bubbleEl) createBubble();
    bubbleEl.style.left = `${Math.round(x)}px`;
    bubbleEl.style.top = `${Math.round(y)}px`;
    bubbleEl.classList.remove("quick-highlighter-hidden");
  }

  function onMouseUp() {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (!text) {
      hideBubble();
      return;
    }
    lastSelection = text;

    // Position bubble near selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.left + (rect.width / 2) + window.scrollX - 60;
    const y = rect.top + window.scrollY - 40; // above selection
    showBubbleAt(x, y);
  }

  function onSave() {
    if (!lastSelection) return;

    const payload = {
      type: "saveHighlight",
      data: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: lastSelection,
        url: location.href,
        title: document.title,
        timestamp: Date.now()
      }
    };
    chrome.runtime.sendMessage(payload, (resp) => {
      if (chrome.runtime.lastError) {
        console.warn("Save error:", chrome.runtime.lastError.message);
      }
      // Give feedback in bubble
      const status = bubbleEl.querySelector(".status");
      if (status) {
        status.textContent = "Saved!";
        setTimeout(() => {
          status.textContent = "Save highlight?";
          hideBubble();
          lastSelection = "";
          window.getSelection().removeAllRanges();
        }, 800);
      } else {
        hideBubble();
      }
    });
  }

  // Hide bubble when clicking elsewhere, scrolling, or resizing
  document.addEventListener("mouseup", onMouseUp, { passive: true });
  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      hideBubble();
      window.getSelection().removeAllRanges();
    }
  }, { passive: true });
  window.addEventListener("scroll", hideBubble, { passive: true });
  window.addEventListener("resize", hideBubble, { passive: true });
})();
