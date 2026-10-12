// Shared by popup and background. Where Setlo lives + optional password (when SETLO_PASSWORD is set).
const DEFAULT_BASE = "http://localhost:3100";
async function getConfig() {
  const { base, password } = await chrome.storage.local.get(["base", "password"]);
  return { base: (base || DEFAULT_BASE).replace(/\/$/, ""), password: password || "" };
}
async function setlo(path, opts = {}) {
  const { base, password } = await getConfig();
  const headers = {};
  if (opts.body) headers["content-type"] = "application/json";
  if (password) headers.authorization = `Bearer ${password}`;
  const res = await fetch(base + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Setlo returned ${res.status}`);
  return data;
}
async function capture(text, target, source) {
  return setlo("/api/capture", { method: "POST", body: JSON.stringify({ text, target, source }) });
}
