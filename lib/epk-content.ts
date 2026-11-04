// ✏️ EDIT THIS FILE to update the whole Saransh EPK. TODO items are placeholders (see docs/epk/PLACEHOLDERS.md).
export const EPK = {
  artist: {
    name: "Saransh",
    tagline: "Work Hard, Play Hard",
    genre: "House Music",
    base: "Brickell, Miami · raised in St. Tropez",
    email: "hasidicn1g@gmail.com",
    phone: "+971 3845 3698",
    phoneHref: "+97138453698",
    bookingUrl: "https://bookinglink.xyz",
    listenUrl: "#discography", // TODO: replace with Spotify artist link
    socials: [
      // TODO: add real handles
      { label: "Spotify", url: "https://open.spotify.com/" },
      { label: "Instagram", url: "https://instagram.com/" },
      { label: "YouTube", url: "https://youtube.com/" },
      { label: "SoundCloud", url: "https://soundcloud.com/" },
    ],
  },
  hero: { video: "/epk/hero.mp4" },
  bio: {
    short:
      "Saransh is a house music producer and DJ who grew up in St. Tropez and now runs his own label out of Brickell, Miami. His debut album Chasing Greatness (2013) earned Grammy recognition, and his sun-soaked, feel-good sound has been the soundtrack to beach clubs and rooftop sunsets ever since.",
    long: [
      "Raised on the French Riviera, Saransh grew up where the Mediterranean meets the dance floor. St. Tropez's beach clubs and sunrise sessions shaped his ear early: warm basslines, open-air grooves, and music that makes a crowd feel like summer never ends.",
      "He moved to Brickell to build something of his own, founding an independent music label and putting his own sound first. In 2013 he released his debut album, Chasing Greatness, a record that put him on the map and earned Grammy recognition.",
      "Since then he has followed it with singles Flyaway and Solo (2014), keeping the formula simple: chill, sunny, melodic house built for the shoreline. His motto runs through everything he does: Work Hard, Play Hard.",
    ],
  },
  style: {
    tags: ["House", "Melodic House", "Deep House", "Tropical", "Beach Club", "Sunset Sessions"],
    soundsLike: ["Kygo", "Lane 8", "Monolink"], // TODO: confirm influences
    moods: [
      { label: "Chill", value: 85 },
      { label: "Groove", value: 80 },
      { label: "Energy", value: 60 },
      { label: "Sunshine", value: 98 },
    ],
    // TODO: add { title, src } where src is a Spotify/SoundCloud/YouTube *embed* URL
    embeds: [] as { title: string; src: string }[],
  },
  discography: [
    // newest first
    { title: "Solo", type: "Single", year: 2014, cover: "/epk/assets/cover-solo.svg", url: "#" },
    { title: "Flyaway", type: "Single", year: 2014, cover: "/epk/assets/cover-flyaway.svg", url: "#" },
    { title: "Chasing Greatness", type: "Album", year: 2013, cover: "/epk/assets/cover-chasing.svg", url: "#" },
  ],
  highlights: [
    "Grammy recognition for debut album Chasing Greatness",
    "Founder of an independent record label, Brickell, Miami",
    "Headline-ready sets for beach clubs, rooftops and festivals",
  ],
  quotes: [
    // TODO: replace with real press quotes
    { text: "Pure summer in audio form.", by: "Placeholder Magazine" },
    { text: "The sound of the shoreline at golden hour.", by: "Placeholder Blog" },
  ],
  photos: [
    { src: "/epk/assets/press-1.svg", alt: "Sunset over the sea with a palm tree", hires: "/epk/assets/press-1.svg" },
    { src: "/epk/assets/press-2.svg", alt: "Surfboard on turquoise waves", hires: "/epk/assets/press-2.svg" },
    { src: "/epk/assets/press-3.svg", alt: "Pink and purple dusk over the ocean", hires: "/epk/assets/press-3.svg" },
    { src: "/epk/assets/press-4.svg", alt: "Bright beach day with palm and surfboard", hires: "/epk/assets/press-4.svg" },
  ],
  rider: {
    lineup: [{ who: "Saransh", role: "DJ / Producer, live performance" }],
    // Positions in the 600x340 stage plot (audience view)
    stagePlot: [
      { label: "DJ booth (Saransh)", x: 300, y: 150, w: 200, h: 60, kind: "dj" },
      { label: "Monitor L", x: 100, y: 150, w: 60, h: 36, kind: "mon" },
      { label: "Monitor R", x: 500, y: 150, w: 60, h: 36, kind: "mon" },
      { label: "Power x4", x: 300, y: 70, w: 70, h: 30, kind: "pwr" },
      { label: "Mic", x: 450, y: 230, w: 36, h: 36, kind: "mic" },
    ] as { label: string; x: number; y: number; w: number; h: number; kind: "dj" | "mon" | "pwr" | "mic" }[],
    inputs: [
      // TODO: confirm real gear
      { ch: 1, src: "DJ mixer / controller, Master L", mic: "DI (XLR)", notes: "Provided by artist" },
      { ch: 2, src: "DJ mixer / controller, Master R", mic: "DI (XLR)", notes: "Provided by artist" },
      { ch: 3, src: "Vocal / MC mic", mic: "SM58 or similar", notes: "Short boom stand" },
    ],
    bring: ["DJ controller / media players", "Laptop and headphones", "Stage-ready cables and adapters"],
    provide: [
      "Pro PA system suitable for room size",
      "2x stage monitors",
      "DJ booth table (min. 2m x 0.8m, sturdy, 100cm high)",
      "1 wireless or wired vocal mic with stand",
    ],
    monitoring: "2 floor wedges, mixed to a single DJ-controlled send. No IEMs required.",
    power: "4 x 230V/110V outlets within 1.5m of the DJ table, on a clean circuit (separate from lighting).",
    schedule: { loadIn: "90 minutes before doors", soundcheck: "30 minutes", set: "60-120 minutes (flexible)" },
    production: { name: "Saransh (booking & production)", email: "hasidicn1g@gmail.com", phone: "+971 3845 3698" },
  },
}
