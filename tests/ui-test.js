// Interaction checks: flash measurement round trip, wall Play, chart goals, explore links. Usage as shots.js.
const puppeteer = require("puppeteer-core"), path = require("path");
const url = "file://" + path.join(__dirname, "..", "index.html");
let fails = 0; const ok = (n, c) => { console.log((c ? "  ok    " : "  FAIL  ") + n); if (!c) fails++; };
(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const page = await browser.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url + "#flash:1", { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 3700));
  // click the plot at the true t1/2 and check
  const res = await page.evaluate(() => {
    const cv = document.querySelector("#flashPlot"), r = cv.getBoundingClientRect();
    const I = tabs.flash.info(); const L = 58, R = r.width - 22;
    const x = r.left + L + I.th / I.tmax * (R - L);
    cv.dispatchEvent(new MouseEvent("click", { clientX: x, clientY: r.top + r.height / 2, bubbles: true }));
    document.querySelector("#flashCheck").click();
    return { inp: document.querySelector("#flashIn").value, status: document.querySelector("#flashStatus").textContent, th: I.th };
  });
  ok("flash click fills t1/2 (" + res.inp + " vs " + res.th.toFixed(4) + ")", Math.abs(res.inp / res.th - 1) < 0.03);
  ok("flash check passes: " + res.status, res.status.startsWith("✓"));
  const bad = await page.evaluate(() => { const i = document.querySelector("#flashIn"); i.value = "1"; i.dispatchEvent(new Event("input")); document.querySelector("#flashCheck").click(); return document.querySelector("#flashStatus").textContent; });
  ok("flash check rejects a wrong reading", bad.startsWith("Off"));
  // mystery reveals identity only on check
  await page.goto(url + "#flash:3", { waitUntil: "load" }); await new Promise(r => setTimeout(r, 3700));
  const hid = await page.evaluate(() => document.body.innerText.includes("316 stainless"));
  ok("mystery identity hidden before check", !hid);
  // wall play advances time
  await page.goto(url + "#wall", { waitUntil: "load" });
  await page.click("#wallZero"); await page.click("#wallPlay"); await new Promise(r => setTimeout(r, 1500));
  const t = await page.evaluate(() => tabs.wall.st.t);
  ok("wall Play advances time (t = " + t.toPrecision(3) + " s)", t > 0.1);
  // chart goals produce a ranked list with a #1
  for (const g of ["months", "hour", "store", "kiln"]) {
    await page.evaluate(g => document.querySelector('#chartGoal [data-v="' + g + '"]').click(), g);
    const first = await page.evaluate(() => document.querySelector("#chartRank li span").textContent);
    const want = { months: "Polystyrene foam", hour: "Neoprene", store: "Titanium alloy", kiln: "Refractory brick" }[g];
    ok("chart " + g + " ranks " + want + " first (" + first + ")", first.startsWith(want));
  }
  // every explore question sets up without error
  for (const tab of ["chip", "wall", "flash", "chart"]) {
    const n = await page.evaluate(t => guides[t].count, tab);
    for (let i = 1; i <= n; i++) { await page.goto(url + "#" + tab + ":" + i, { waitUntil: "load" }); await new Promise(r => setTimeout(r, 150)); }
  }
  ok("no page errors (" + errs.join("; ") + ")", errs.length === 0);
  await browser.close();
  console.log(fails ? fails + " FAILED" : "All UI checks pass."); process.exit(fails ? 1 : 0);
})();
