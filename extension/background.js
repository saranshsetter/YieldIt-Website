importScripts("shared.js");

function badge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "capture-snippet" && command !== "capture-note") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let text = "";
  try {
    const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => String(window.getSelection() || "") });
    text = (res && res.result) || "";
  } catch (e) {
    // chrome:// pages and the Web Store can't be scripted.
  }
  if (!text.trim()) return badge("∅", "#8C909A");
  try {
    await capture(text.trim(), command === "capture-note" ? "note" : "snippet", tab.url);
    badge("✓", "#5B5BFF");
  } catch (e) {
    console.warn("Setlo capture failed:", e.message);
    badge("!", "#E5484D");
  }
});
