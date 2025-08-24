const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");
const clearBtn = document.getElementById("clear");

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function render(highlights) {
  const q = (searchEl.value || "").toLowerCase();
  const filtered = !q ? highlights : highlights.filter(h =>
    h.text.toLowerCase().includes(q) ||
    (h.title || "").toLowerCase().includes(q) ||
    (h.url || "").toLowerCase().includes(q)
  );

  listEl.innerHTML = "";
  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No highlights yet.";
    listEl.appendChild(empty);
    return;
  }

  for (const h of filtered) {
    const card = document.createElement("div");
    card.className = "card";

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = h.text;

    const meta = document.createElement("div");
    meta.className = "meta";

    const leftMeta = document.createElement("div");
    const url = new URL(h.url);
    leftMeta.textContent = `${url.hostname} • ${fmtDate(h.timestamp)}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const openBtn = document.createElement("a");
    openBtn.className = "link";
    openBtn.textContent = "Open";
    openBtn.href = h.url;
    openBtn.target = "_blank";
    openBtn.rel = "noreferrer";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      chrome.runtime.sendMessage({ type: "deleteHighlight", id: h.id }, () => {
        load(); // refresh list
      });
    });

    actions.appendChild(openBtn);
    actions.appendChild(delBtn);
    meta.appendChild(leftMeta);
    meta.appendChild(actions);

    card.appendChild(text);
    card.appendChild(meta);
    listEl.appendChild(card);
  }
}

function load() {
  chrome.runtime.sendMessage({ type: "getHighlights" }, (resp) => {
    if (resp?.ok) render(resp.highlights || []);
  });
}

searchEl.addEventListener("input", load);
clearBtn.addEventListener("click", async () => {
  if (!confirm("Clear all highlights?")) return;
  chrome.storage.local.set({ highlights: [] }, load);
});

// Live update when storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.highlights) {
    load();
  }
});

load();
