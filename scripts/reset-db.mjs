// Deletes the local SQLite file; it is recreated and re-seeded on the next request.
import fs from "node:fs";
import path from "node:path";
const file = process.env.SETLO_DB_PATH || path.join(process.cwd(), "data", "setlo.db");
for (const f of [file, `${file}-wal`, `${file}-shm`]) fs.rmSync(f, { force: true });
console.log(`Removed ${file}. Restart \`npm run dev\` to re-seed.`);
