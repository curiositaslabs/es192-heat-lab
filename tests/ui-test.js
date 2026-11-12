// Interaction checks: lesson flow, try-it goals, cup race, chart drag. Usage as shots.js.
const puppeteer = require("puppeteer-core"), path = require("path");
const url = "file://" + path.join(__dirname, "..", "index.html");
const wait = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, c) => { console.log((c ? "  ok    " : "  FAIL  ") + n); if (!c) fails++; };
(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const page = await browser.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url + "#chip:1", { waitUntil: "load" }); await wait(200);
  await page.click('[data-lesson="chip"] .opts button:nth-child(2)');
  ok("chip step 1: answering shows copper", await page.evaluate(() => scenes.chip.st.mat === "cu" && document.querySelector('[data-lesson="chip"] .opts .right') !== null));
  await page.click('[data-lesson="chip"] [data-x="next"]'); await page.click('[data-lesson="chip"] [data-x="next"]');
  ok("chip step 3 is a Try it", await page.evaluate(() => document.querySelector('[data-lesson="chip"] .kind').textContent === "Try it"));
  await page.click('#chipTiles [data-m="aln"]');
  await page.evaluate(() => { const i = document.querySelector("#chipX"); i.value = "1"; i.dispatchEvent(new Event("input")); });
  ok("chip try-it completes at AlN 1 mm", await page.evaluate(() => document.querySelector('[data-lesson="chip"] .status.ok') !== null));
  await page.goto(url + "#touch:3", { waitUntil: "load" }); await wait(200);
  await page.click('#s-touch .pill[data-t="33"]');
  ok("touch try-it completes at 33 C", await page.evaluate(() => document.querySelector('[data-lesson="touch"] .status.ok') !== null));
  await page.goto(url + "#cup:3", { waitUntil: "load" }); await wait(200);
  await page.evaluate(() => { const i = document.querySelector("#cupW"); i.value = "4"; i.dispatchEvent(new Event("input")); });
  await page.click("#cupGo"); await wait(8600);
  ok("cup race finishes and try-it completes at 4 mm", await page.evaluate(() => !scenes.cup.st.running && document.querySelector('[data-lesson="cup"] .status.ok') !== null));
  await page.goto(url + "#wall", { waitUntil: "load" }); await wait(200);
  for (const [g, want] of [["months", "foam"], ["hour", "neoprene"], ["store", "ti"], ["kiln", "firebrick"]]) {
    await page.click('#goalTiles [data-g="' + g + '"]');
    ok("chart " + g + ": gold goes to " + want, await page.evaluate(w => scenes.wall.winners()[0] === w, want));
  }
  // drag the line down on the kiln goal: more winners above the bar become eligible? (line moves)
  const before = await page.evaluate(() => scenes.wall.st.lM);
  const box = await (await page.$("#cvWall")).boundingBox();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3); await page.mouse.down(); await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.6, { steps: 5 }); await page.mouse.up();
  ok("dragging moves the selection line", await page.evaluate(b => Math.abs(scenes.wall.st.lM - b) > 0.05, before));
  ok("key ideas dialog opens", await page.evaluate(() => { document.querySelector("#ideasBtn").click(); const o = document.querySelector("#ideas").open; document.querySelector("#ideasClose").click(); return o; }));
  ok("no page errors (" + errs.join("; ") + ")", errs.length === 0);
  await browser.close();
  console.log(fails ? fails + " FAILED" : "All UI checks pass."); process.exit(fails ? 1 : 0);
})();
