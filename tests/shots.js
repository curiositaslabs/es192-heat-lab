// Screenshot every scene and lesson step (after answering), light/dark/phone; fail on page errors or overflow.
// Usage: NODE_PATH=<dir with puppeteer-core> node tests/shots.js
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs");
const url = "file://" + path.join(__dirname, "..", "index.html");
const out = path.join(__dirname, "out"); fs.mkdirSync(out, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const errors = [];
  const plan = { chip: 4, touch: 4, cup: 4, wall: 5 };
  for (const [vp, theme] of [[{ width: 1440, height: 900 }, "light"], [{ width: 1440, height: 900 }, "dark"], [{ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, "light"]]) {
    const page = await browser.newPage();
    page.on("pageerror", e => errors.push(e.message));
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
    await page.setViewport(vp);
    for (const [scene, n] of Object.entries(plan)) {
      for (let k = 1; k <= n; k++) {
        if (theme === "dark" && k > 1) continue;
        await page.goto(url + "#" + scene + ":" + k, { waitUntil: "load" }); await wait(300);
        // answer a prediction (first option), then wait for any animation
        const answered = await page.evaluate(sc => { const b = document.querySelector('[data-lesson="' + sc + '"] .opts button'); if (b) { b.click(); return true; } return false; }, scene);
        await wait(scene === "cup" && answered ? 8600 : 400);
        await page.screenshot({ path: path.join(out, `${scene}-${k}-${vp.width}-${theme}.png`), fullPage: vp.width < 500 });
      }
    }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) errors.push(`horizontal overflow ${over}px at ${vp.width}`);
    await page.close();
  }
  await browser.close();
  if (errors.length) { console.log("ERRORS:\n" + errors.join("\n")); process.exit(1); }
  console.log("shots written to tests/out, no page errors");
})();
