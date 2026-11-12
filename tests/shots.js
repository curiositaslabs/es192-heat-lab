// Screenshot every bench and every Explore setup, light and dark, desktop and phone; fail on page errors.
// Usage: NODE_PATH=<dir with puppeteer> node tests/shots.js
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const url = "file://" + path.join(__dirname, "..", "index.html");
const out = path.join(__dirname, "out"); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const errors = [];
  const shots = [
    ["chip", 0], ["chip", 1], ["chip", 2], ["chip", 3],
    ["wall", 0], ["wall", 1], ["wall", 2], ["wall", 3], ["wall", 4],
    ["flash", 0], ["flash", 1], ["flash", 3],
    ["chart", 0], ["chart", 1], ["chart", 2], ["chart", 3], ["chart", 4]
  ];
  for (const [vp, theme] of [[{ width: 1440, height: 900 }, "light"], [{ width: 1440, height: 900 }, "dark"], [{ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, "light"]]) {
    const page = await browser.newPage();
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
    await page.setViewport(vp);
    for (const [tab, q] of shots) {
      if (vp.width < 500 && q > 1) continue;
      await page.goto(url + "#" + tab + (q ? ":" + q : ""), { waitUntil: "load" });
      await new Promise(r => setTimeout(r, tab === "flash" && q ? 3800 : 500));
      const name = `${tab}${q ? "-q" + q : ""}-${vp.width}-${theme}.png`;
      await page.screenshot({ path: path.join(out, name), fullPage: vp.width < 500 });
    }
    // horizontal overflow check
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) errors.push(`horizontal overflow ${over}px at ${vp.width}`);
    await page.close();
  }
  await browser.close();
  if (errors.length) { console.log("ERRORS:\n" + errors.join("\n")); process.exit(1); }
  console.log("shots written to tests/out, no page errors");
})();
