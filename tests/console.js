// Print console messages and page errors for one URL hash. Usage: NODE_PATH=... node tests/console.js chip
const puppeteer = require("puppeteer-core"), serve = require("./serve");
(async () => {
  const srv = await serve();
  const b = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
  p.on("console", m => console.log("console." + m.type() + ":", m.text())); p.on("pageerror", e => console.log("PAGEERROR:", e.message)); p.on("requestfailed", r => console.log("REQFAIL:", r.url()));
  await p.goto(srv.url + "#" + (process.argv[2] || "chip"), { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 6000));
  console.log("ready:", await p.evaluate(() => window.heatLabReady));
  await b.close(); srv.close();
})();
