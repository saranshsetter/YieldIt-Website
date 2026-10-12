const $ = (id) => document.getElementById(id);
let snippets = [], shown = [], sel = 0;

function say(t) { $("msg").textContent = t; }

function render() {
  const q = $("q").value.toLowerCase();
  shown = snippets.filter((s) => `${s.title} ${s.body} ${s.category}`.toLowerCase().includes(q));
  sel = Math.min(sel, Math.max(shown.length - 1, 0));
  $("list").innerHTML = "";
  shown.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "item" + (i === sel ? " sel" : "");
    el.innerHTML = `<div><span class="t"></span><span class="c"></span></div><div class="b"></div>`;
    el.querySelector(".t").textContent = s.title;
    el.querySelector(".c").textContent = s.category;
    el.querySelector(".b").textContent = s.rendered;
    el.onclick = () => copy(s);
    el.onmouseenter = () => { sel = i; document.querySelectorAll(".item").forEach((n, j) => n.classList.toggle("sel", j === i)); };
    $("list").appendChild(el);
  });
}

async function copy(s) {
  await navigator.clipboard.writeText(s.rendered);
  setlo(`/api/snippets/${s.id}`, { method: "PATCH", body: JSON.stringify({ used: true }) }).catch(() => {});
  say(`Copied “${s.title}”`);
  setTimeout(() => window.close(), 450);
}

async function load() {
  const cfg = await getConfig();
  $("base").value = cfg.base;
  $("password").value = cfg.password;
  try {
    const data = await setlo("/api/snippets?fill=active");
    snippets = data.snippets;
    $("lead").textContent = data.lead ? `for ${data.lead.first_name} ${data.lead.last_name}` : "no active lead";
    $("err").style.display = "none";
    render();
  } catch (e) {
    $("err").textContent = `Can't reach Setlo at ${cfg.base}: ${e.message}. Check Settings below.`;
    $("err").style.display = "block";
    $("settings").open = true;
  }
}

async function clip(target) {
  try {
    const text = (await navigator.clipboard.readText()).trim();
    if (!text) return say("Clipboard is empty");
    const r = await capture(text, target, "clipboard");
    say(r.saved === "note" ? `Note added to ${r.lead}` : "Saved as snippet");
    if (r.saved === "snippet") load();
  } catch (e) { say(e.message); }
}

$("q").addEventListener("input", () => { sel = 0; render(); });
$("q").addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { sel = Math.min(sel + 1, shown.length - 1); render(); e.preventDefault(); }
  if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
  if (e.key === "Enter" && shown[sel]) copy(shown[sel]);
});
$("clipSnippet").onclick = () => clip("snippet");
$("clipNote").onclick = () => clip("note");
$("openApp").onclick = async () => chrome.tabs.create({ url: (await getConfig()).base });
$("saveCfg").onclick = async () => {
  const base = $("base").value.trim().replace(/\/$/, "");
  // Custom domains need a one-time host permission grant (localhost and *.vercel.app are built in).
  if (/^https:\/\//.test(base) && !/\.vercel\.app$/.test(new URL(base).hostname)) {
    const ok = await chrome.permissions.request({ origins: [`${new URL(base).origin}/*`] });
    if (!ok) return say("Permission denied for that domain");
  }
  await chrome.storage.local.set({ base, password: $("password").value });
  say("Saved");
  load();
};
load();
