// One screenshot. Usage: NODE_PATH=... node tests/snap.js "<hash>" <out.png> [answer] [ir] [waitMs] [width] [height]
const puppeteer = require("puppeteer-core"), serve = require("./serve");
(async () => {
  const [hash, out, answer, ir, waitMs, w, h] = process.argv.slice(2);
  const srv = await serve();
  const b = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const p = await b.newPage(); await p.setViewport({ width: +(w || 1440), height: +(h || 900), deviceScaleFactor: 1 });
  p.on("pageerror", e => console.log("PAGEERROR:", e.message));
  await p.goto(srv.url + "#" + hash, { waitUntil: "load" });
  await p.waitForFunction("window.heatLabReady === true", { timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
  const sc = hash.split(":")[0];
  if (answer === "1") await p.evaluate(sc => { const b = document.querySelector('[data-lesson="' + sc + '"] .opts button'); if (b) b.click(); }, sc);
  if (ir === "1") await p.evaluate(sc => document.querySelector('[data-ir="' + sc + '"]').click(), sc);
  await new Promise(r => setTimeout(r, +(waitMs || 1500)));
  await p.screenshot({ path: out }); await b.close(); srv.close(); console.log("ok", out);
})();
