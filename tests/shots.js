// Screenshot every scene and lesson step (after answering), light/dark/phone; fail on page errors or overflow.
// Usage: NODE_PATH=<dir with puppeteer-core> node tests/shots.js [only-scene]
const puppeteer = require("puppeteer-core"), path = require("path"), fs = require("fs"), serve = require("./serve");
const out = path.join(__dirname, "out"); fs.mkdirSync(out, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = await serve();
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const errors = [], only = process.argv[2];
  const plan = { chip: 4, touch: 4, cup: 4, wall: 5 };
  const views = process.env.QUICK ? [[{ width: 1440, height: 900 }, "light"]] : [[{ width: 1440, height: 900 }, "light"], [{ width: 1440, height: 900 }, "dark"], [{ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, "light"]];
  for (const [vp, theme] of views) {
    const page = await browser.newPage();
    page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
    await page.setViewport(vp);
    for (const [scene, n] of Object.entries(plan)) {
      if (only && scene !== only) continue;
      for (let k = 1; k <= n; k++) {
        if ((theme === "dark" || vp.width < 500) && k > 2) continue;
        await page.goto(srv.url + "#" + scene + ":" + k, { waitUntil: "load" });
        await page.waitForFunction("window.heatLabReady === true", { timeout: 30000 }).catch(() => errors.push("not ready: " + scene));
        await wait(600);
        const answered = await page.evaluate(sc => { const b = document.querySelector('[data-lesson="' + sc + '"] .opts button'); if (b) { b.click(); return true; } return false; }, scene);
        await wait(scene === "cup" && answered ? 9500 : 1500);
        await page.screenshot({ path: path.join(out, `${scene}-${k}-${vp.width}-${theme}.png`), fullPage: vp.width < 500 });
      }
      if (scene !== "wall" && vp.width > 500 && theme === "light") {   // thermal camera view
        await page.goto(srv.url + "#" + scene + ":2", { waitUntil: "load" }); await page.waitForFunction("window.heatLabReady === true", { timeout: 30000 }).catch(() => {});
        await wait(500); await page.evaluate(sc => { const b = document.querySelector('[data-lesson="' + sc + '"] .opts button'); if (b) b.click(); document.querySelector('[data-ir="' + sc + '"]').click(); }, scene);
        await wait(scene === "cup" ? 9500 : 1500);
        await page.screenshot({ path: path.join(out, `${scene}-thermal-${vp.width}.png`) });
      }
    }
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (over > 1) errors.push(`horizontal overflow ${over}px at ${vp.width}`);
    await page.close();
  }
  await browser.close(); srv.close();
  if (errors.length) { console.log("ERRORS:\n" + [...new Set(errors)].join("\n")); process.exit(1); }
  console.log("shots written to tests/out, no page errors");
})();
