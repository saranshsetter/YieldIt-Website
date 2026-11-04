"use client"

import { useEffect, useRef, useState } from "react"
import MetroHero from "@/components/ui/scroll-locked-video-hero"
import { EPK } from "@/lib/epk-content"

const A = EPK.artist
const R = EPK.rider
const NAV = [
  ["bio", "Bio"],
  ["music", "Music"],
  ["discography", "Discography"],
  ["rider", "Tech Rider"],
  ["photos", "Photos"],
] as const
const PLOT_COLORS = { dj: "#0b2a3a", mon: "#ff7a45", pwr: "#ffc857", mic: "#1aa6b7" }

export default function EpkSite({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [locked, setLocked] = useState(true)
  const [active, setActive] = useState("")
  const [copied, setCopied] = useState("")
  const [lb, setLb] = useState<number | null>(null)
  const [print, setPrint] = useState<"" | "print-rider" | "print-kit">("")
  const [metersOn, setMetersOn] = useState(false)

  // scroll reveal, meters, active nav
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }),
      { rootMargin: "0px 0px -8% 0px" },
    )
    el.querySelectorAll(".rv").forEach((n) => io.observe(n))
    const mo = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setMetersOn(true)), { threshold: 0.3 })
    const m = el.querySelector("#meters")
    if (m) mo.observe(m)
    const so = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    )
    el.querySelectorAll("main section[id]").forEach((s) => so.observe(s))
    return () => { io.disconnect(); mo.disconnect(); so.disconnect() }
  }, [])

  // lightbox: Escape to close
  useEffect(() => {
    if (lb === null) return
    const k = (e: KeyboardEvent) => e.key === "Escape" && setLb(null)
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [lb])

  // print helpers
  useEffect(() => {
    if (!print) return
    const done = () => setPrint("")
    window.addEventListener("afterprint", done, { once: true })
    const t = setTimeout(() => window.print(), 50)
    return () => { clearTimeout(t); window.removeEventListener("afterprint", done) }
  }, [print])

  async function copy(kind: "short" | "long") {
    const text = kind === "short" ? EPK.bio.short : EPK.bio.long.join("\n\n")
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement("textarea"); ta.value = text; document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove()
    }
    setCopied("Copied ✓"); setTimeout(() => setCopied(""), 2200)
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = `Name: ${f.get("name")}\nEmail: ${f.get("email")}\nEvent: ${f.get("event")}\n\n${f.get("msg")}`
    location.href = `mailto:${A.email}?subject=${encodeURIComponent("Booking enquiry: " + f.get("name"))}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className={`epk ${className} ${print}`} ref={root}>
      <header className={`nav${locked ? " hide" : ""}`} aria-hidden={locked}>
        <a className="logo" href="#top" aria-label="Saransh, back to top">SARANSH<span>.</span></a>
        <nav aria-label="Sections">
          <ul>
            {NAV.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} className={active === id ? "on" : ""}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <a className="btn btn-sun" href="#contact">Book</a>
      </header>

      <div id="top" className="no-print">
        <MetroHero
          videoSrc={EPK.hero.video}
          title="SARANSH"
          tagline={A.tagline}
          scrollHint="SCROLL TO ENTER"
          signature={false}
          scrubDistance={2600}
          onLockChange={setLocked}
        />
      </div>

      <main id="main">
        <section id="bio" className="sec">
          <div className="wrap grid2 rv">
            <div>
              <p className="kicker">01 · Biography</p>
              <h2>Sun, bass &amp; a label of his own.</h2>
              <div className="copy">
                <button className="btn btn-line" onClick={() => copy("short")}>Copy short bio</button>
                <button className="btn btn-line" onClick={() => copy("long")}>Copy long bio</button>
                <span role="status" aria-live="polite" id="copied">{copied}</span>
              </div>
              <div className="copy">
                <a className="btn btn-sun" href={A.listenUrl}>Listen</a>
                <button className="btn btn-ghost no-print" type="button" onClick={() => setPrint("print-kit")}>Download Press Kit</button>
              </div>
              <ul className="highlights" aria-label="Highlights">
                {EPK.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div className="prose">
              <p className="lead">{EPK.bio.short}</p>
              {EPK.bio.long.map((p) => <p key={p}>{p}</p>)}
            </div>
          </div>
          <div className="wrap rv">
            <div className="quotes">
              {EPK.quotes.map((q) => (
                <blockquote key={q.text}>“{q.text}”<cite>{q.by}</cite></blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="music" className="sec sand">
          <div className="wrap rv">
            <p className="kicker">02 · Music Style</p>
            <h2>Chill, sunny, melodic house.</h2>
            <div className="grid2 style">
              <div>
                <div className="tags">{EPK.style.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <p className="sounds">Sounds like <b>{EPK.style.soundsLike.join(" · ")}</b></p>
                <div className="meters" id="meters">
                  {EPK.style.moods.map((m) => (
                    <div className="meter" key={m.label}>
                      <span>{m.label}</span>
                      <div className="bar"><i style={{ width: metersOn ? `${m.value}%` : 0 }} /></div>
                      <span>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {EPK.style.embeds.length ? (
                  EPK.style.embeds.map((e) => (
                    <iframe key={e.src} className="player" src={e.src} title={e.title} loading="lazy" allowFullScreen allow="autoplay; encrypted-media" />
                  ))
                ) : (
                  <div className="soon">
                    <p className="kicker">Now spinning</p>
                    <h3>Player coming soon</h3>
                    <p>Full tracks and live sets will be streaming here. In the meantime, check the releases below.</p>
                    <a className="btn btn-sun" href="#discography" style={{ justifySelf: "start" }}>See releases</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="discography" className="sec">
          <div className="wrap rv">
            <p className="kicker">03 · Discography</p>
            <h2>Releases, newest first.</h2>
            <ol className="releases">
              {EPK.discography.map((r) => (
                <li className="rel" key={r.title}>
                  <a href={r.url}>
                    <div className="art">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.cover} alt={`Cover art for ${r.title}`} loading="lazy" />
                      <b>Listen ▶</b>
                    </div>
                    <h3>{r.title}</h3>
                    <p>{r.type} · {r.year}</p>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="rider" className="sec paper">
          <div className="wrap rv">
            <div className="rider-head">
              <div><p className="kicker">04 · Tech Rider</p><h2>What Saransh needs to perform.</h2></div>
              <button className="btn btn-ink no-print" type="button" onClick={() => setPrint("print-rider")}>Download Tech Rider (PDF)</button>
            </div>
            <div className="rgrid">
              <div className="card"><h3>Lineup</h3><ul>{R.lineup.map((l) => <li key={l.who}><b>{l.who}</b>, {l.role}</li>)}</ul></div>
              <div className="card"><h3>Sound check &amp; setup</h3>
                <dl><dt>Load-in</dt><dd>{R.schedule.loadIn}</dd><dt>Soundcheck</dt><dd>{R.schedule.soundcheck}</dd><dt>Set length</dt><dd>{R.schedule.set}</dd></dl></div>
              <div className="card"><h3>Monitoring &amp; power</h3><p><b>Monitors:</b> {R.monitoring}</p><p><b>Power:</b> {R.power}</p></div>
            </div>
            <h3 className="sub">Stage plot <small>(audience view)</small></h3>
            <figure className="plot">
              <svg viewBox="0 0 600 340" role="img" aria-label="Stage plot: DJ booth centre stage, monitors left and right, power drop behind, vocal mic front right">
                <rect x="20" y="20" width="560" height="270" rx="12" fill="#f6ecda" stroke="#0b2a3a" strokeWidth="2" />
                <text x="30" y="40" fontSize="11" fill="#0b2a3a" opacity=".6">BACK OF STAGE</text>
                {R.stagePlot.map((p) => (
                  <g key={p.label}>
                    <rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} rx={p.kind === "mic" ? p.w / 2 : 8} fill={PLOT_COLORS[p.kind]} />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={p.w < 80 ? 9 : 12} fontWeight={700} fill={p.kind === "dj" ? "#f6ecda" : "#0b2a3a"}>
                      {{ dj: "DJ BOOTH", mic: "MIC", mon: "MON", pwr: "PWR" }[p.kind]}
                    </text>
                    <text x={p.x} y={p.y + p.h / 2 + 14} textAnchor="middle" fontSize="10" fill="#0b2a3a">{p.label}</text>
                  </g>
                ))}
                <path d="M20 292H580" stroke="#0b2a3a" strokeWidth="3" strokeDasharray="6 6" />
                <text x="300" y="316" textAnchor="middle" fontSize="12" fontWeight={700} fill="#0b2a3a">▼ AUDIENCE ▼</text>
              </svg>
            </figure>
            <h3 className="sub">Input list</h3>
            <div className="tablewrap">
              <table>
                <thead><tr><th>Ch</th><th>Instrument / source</th><th>Mic or DI</th><th>Stand / notes</th></tr></thead>
                <tbody>{R.inputs.map((i) => <tr key={i.ch}><td>{i.ch}</td><td>{i.src}</td><td>{i.mic}</td><td>{i.notes}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="rgrid">
              <div className="card"><h3>Artist brings</h3><ul>{R.bring.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="card"><h3>Venue provides</h3><ul>{R.provide.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <p className="prod">Production contact: {R.production.name} · <a href={`mailto:${R.production.email}`}>{R.production.email}</a> · {R.production.phone}</p>
          </div>
        </section>

        <section id="photos" className="sec">
          <div className="wrap rv">
            <p className="kicker">05 · Press Photos</p>
            <h2>Thumbnails here, hi-res on tap.</h2>
            <div className="gallery">
              {EPK.photos.map((p, i) => (
                <button key={p.src} onClick={() => setLb(i)} aria-label={`Open photo: ${p.alt}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="sec contact">
          <div className="wrap grid2 rv">
            <div>
              <p className="kicker">Booking &amp; Press</p>
              <h2>Let&apos;s make your summer longer.</h2>
              <p className="lead">
                <a href={`mailto:${A.email}`}>{A.email}</a><br />
                <a href={`tel:${A.phoneHref}`}>{A.phone}</a><br />
                <a href={A.bookingUrl} target="_blank" rel="noopener noreferrer">{A.bookingUrl.replace("https://", "")}</a>
              </p>
              <div className="socials">
                {A.socials.map((s) => <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>)}
              </div>
            </div>
            <form className="form" onSubmit={submit}>
              <label>Your name<input name="name" required autoComplete="name" /></label>
              <label>Email<input name="email" type="email" required autoComplete="email" /></label>
              <label>Event &amp; date<input name="event" placeholder="Venue, city, date" /></label>
              <label>Message<textarea name="msg" rows={4} required /></label>
              <button className="btn btn-sun" type="submit">Send booking enquiry</button>
              <small>Opens your email app with the message ready to send.</small>
            </form>
          </div>
        </section>
      </main>

      <footer className="foot">
        <span>© {new Date().getFullYear()} Saransh. Work Hard, Play Hard.</span>
        <a href="#top">Back to top ↑</a>
      </footer>

      {lb !== null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={(e) => e.target === e.currentTarget && setLb(null)}>
          <button className="lb-x" onClick={() => setLb(null)} aria-label="Close" autoFocus>×</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={EPK.photos[lb].hires} alt={EPK.photos[lb].alt} />
          <a className="btn btn-sun" href={EPK.photos[lb].hires} download={`saransh-press-${lb + 1}`}>Download hi-res</a>
        </div>
      )}
    </div>
  )
}
