// Renders the ring-and-dot logo to PNG with no dependencies (used once for the extension icons).
import zlib from "node:zlib";
import fs from "node:fs";

const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };

function png(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const s = size / 32, ss = 4;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let acc = [0, 0, 0, 0];
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const px = (x + (sx + 0.5) / ss) / s, py = (y + (sy + 0.5) / ss) / s;
        let c = [0, 0, 0, 0];
        const rx = Math.max(0, Math.abs(px - 16) - 8), ry = Math.max(0, Math.abs(py - 16) - 8);
        if (Math.hypot(rx, ry) <= 8) c = [15, 17, 21, 255];
        const d = Math.hypot(px - 16, py - 16);
        if (Math.abs(d - 9) <= 1.6) c = [91, 91, 255, 255];
        if (Math.hypot(px - 22.4, py - 9.6) <= 3.4) c = [250, 249, 246, 255];
        acc = acc.map((v, i) => v + c[i]);
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      for (let i = 0; i < 4; i++) raw[o + i] = Math.round(acc[i] / (ss * ss));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
for (const n of [16, 48, 128]) fs.writeFileSync(new URL(`../extension/icons/${n}.png`, import.meta.url), png(n));
console.log("icons written");
