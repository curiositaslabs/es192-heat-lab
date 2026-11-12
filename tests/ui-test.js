// Interaction checks: lesson flow, try-it goals, cup race, thermal camera, chart drag. Usage: NODE_PATH=... node tests/ui-test.js
const puppeteer = require("puppeteer-core"), serve = require("./serve");
const wait = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, c) => { console.log((c ? "  ok    " : "  FAIL  ") + n); if (!c) fails++; };
(async () => {
  const srv = await serve();
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.setViewport({ width: 1440, height: 900 });
  const go = async h => { await page.goto(srv.url + "#" + h, { waitUntil: "load" }); await page.waitForFunction("window.heatLabReady === true", { timeout: 30000 }); await wait(300); };
  await go("chip:1");
  await page.click('[data-lesson="chip"] .opts button:nth-child(2)');
  ok("chip step 1: answering switches to copper", await page.evaluate(() => heatLab.scenes3d.chip.st.mat === "cu" && !!document.querySelector('[data-lesson="chip"] .opts .right')));
  ok("chip shows 'Short circuit' for copper", await page.evaluate(() => document.querySelector("#ovChip .big .n").textContent === "Short circuit"));
  await page.click('[data-lesson="chip"] [data-x="next"]'); await page.click('[data-lesson="chip"] [data-x="next"]');
  await page.click('#chipTiles [data-m="aln"]');
  await page.evaluate(() => { const i = document.querySelector("#chipX"); i.value = "1"; i.dispatchEvent(new Event("input")); });
  ok("chip try-it completes at AlN 1 mm", await page.evaluate(() => !!document.querySelector('[data-lesson="chip"] .status.ok')));
  await page.click('[data-ir="chip"]'); await wait(300);
  ok("thermal camera on: IR scale visible, materials swapped", await page.evaluate(() => !document.querySelector("#ovChip .irui").parentElement.hidden && heatLab.scenes3d.chip.ir));
  await page.click('[data-ir="chip"]');
  await go("touch:3");
  await page.click('#s-touch .pill[data-t="33"]');
  ok("touch try-it completes at 33 C", await page.evaluate(() => !!document.querySelector('[data-lesson="touch"] .status.ok')));
  ok("touch tiles list what each material feels", await page.evaluate(() => document.querySelector('#touchTiles [data-m="wood"] small').textContent.includes("33")));
  await go("cup:3");
  await page.evaluate(() => { const i = document.querySelector("#cupW"); i.value = "4"; i.dispatchEvent(new Event("input")); });
  await page.click("#cupGo"); await wait(12000);
  ok("cup race finishes and try-it completes at 4 mm", await page.evaluate(() => heatLab.scenes3d.cup.st.phase === "done" && !!document.querySelector('[data-lesson="cup"] .status.ok')));
  ok("cup tags report too-hot times", await page.evaluate(() => document.querySelector('#ovCup [data-k="glass"]').textContent.includes("too hot after")));
  await go("wall");
  for (const [g, want] of [["months", "foam"], ["hour", "neoprene"], ["store", "ti"], ["kiln", "firebrick"]]) {
    await page.click('#goalTiles [data-g="' + g + '"]');
    ok("chart " + g + ": gold goes to " + want, await page.evaluate(w => heatLab.chart.winners()[0] === w, want));
  }
  const before = await page.evaluate(() => heatLab.chart.st.lM);
  const box = await (await page.$("#cvWall")).boundingBox();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3); await page.mouse.down(); await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.6, { steps: 5 }); await page.mouse.up();
  ok("dragging moves the selection line", await page.evaluate(b => Math.abs(heatLab.chart.st.lM - b) > 0.05, before));
  ok("key ideas dialog opens", await page.evaluate(() => { document.querySelector("#ideasBtn").click(); const o = document.querySelector("#ideas").open; document.querySelector("#ideasClose").click(); return o; }));
  ok("no page errors (" + errs.join("; ") + ")", errs.length === 0);
  await browser.close(); srv.close();
  console.log(fails ? fails + " FAILED" : "All UI checks pass."); process.exit(fails ? 1 : 0);
})();
