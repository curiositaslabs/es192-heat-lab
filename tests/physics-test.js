// Runs the page's own physics block (between /*PHYSICS-START*/ and /*PHYSICS-END*/) and checks
// every number quoted on the page and in the Explore answers. Usage: node tests/physics-test.js
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "heat-lab.html"), "utf8");
const block = src.split("/*PHYSICS-START*/")[1].split("/*PHYSICS-END*/")[0];
const P = new Function(block + "; return {erfc, slabTheta, farFlux, parker, flashTheta, FO_HALF_SEALED, FO_HALF_HELD, MATS};")();
let fails = 0;
function ok(name, got, want, tol = 0.05) {
  const good = Math.abs(got - want) <= tol * Math.abs(want);
  if (!good) fails++;
  console.log((good ? "  ok  " : "  FAIL") + "  " + name.padEnd(58) + " " + (+got.toPrecision(4)) + "   (expect " + want + ")");
}
const M = P.MATS;
// --- the two solution forms must agree where they switch (Fo = 0.05)
for (const xi of [0, 0.3, 0.7, 1]) for (const sealed of [true, false]) {
  const s = sealed ? "sealed" : "held";
  // evaluate just below and above the switch
  ok(`continuity theta xi=${xi} ${s}`, P.slabTheta(xi, 0.0499999, sealed) + 1, P.slabTheta(xi, 0.0500001, sealed) + 1, 1e-4);
}
ok("continuity farFlux", P.farFlux(0.0499999) + 1, P.farFlux(0.0500001) + 1, 1e-4);
ok("continuity flashTheta xi=0.5", P.flashTheta(0.5, 0.0499999) + 1, P.flashTheta(0.5, 0.0500001) + 1, 1e-4);
ok("flash conserves energy (mean theta = 1) at Fo=0.01", (() => { let s = 0, n = 4000; for (let i = 0; i < n; i++) s += P.flashTheta((i + .5) / n, 0.01); return s / n; })(), 1, 0.01);
ok("Parker t1/2 Fourier number 0.1388", P.FO_HALF_HELD, 0.1388, 0.002);
ok("sealed halfway Fourier number", P.FO_HALF_SEALED, 0.38, 0.03);
ok("sealed halfway / (w^2/2a) ratio (About text: 0.76)", P.FO_HALF_SEALED / 0.5, 0.76, 0.02);
ok("held halfway / (w^2/2a) ratio (About text: 0.28)", P.FO_HALF_HELD / 0.5, 0.28, 0.02);
ok("steady profile held = 1 - xi at Fo=5", P.slabTheta(0.25, 5, false), 0.75, 1e-3);
ok("sealed slab uniform at Fo=5", P.slabTheta(1, 5, true), 1, 1e-3);
// --- Chip (slide 6): 10 W on 1 mm2, X = 2 mm, back at 30 C
const chip = (k, X = 0.002) => 30 + 1e7 * X / M[k].lam;
ok("chip on AlN, C (slide: ~150)", chip("aln"), 148);
ok("chip on alumina, C (slide: rise ~600)", chip("alumina"), 636);
ok("AlN rise at 1 mm, C (answer: ~59)", chip("aln", 0.001) - 30, 59);
ok("chip on AlN at 1 mm, C (answer: near 90)", chip("aln", 0.001), 89);
ok("AlN/alumina conductivity ratio (answer: five times)", M.aln.lam / M.alumina.lam, 5.2);
// --- Wall
const half = (k, w, sealed) => (sealed ? P.FO_HALF_SEALED : P.FO_HALF_HELD) * w * w / M[k].a;
ok("neoprene a (Ashby reads 5e-8)", M.neoprene.a, 5e-8, 0.05);
ok("foam halfway, 20 mm sealed, min (answer: ~3)", half("psfoam", 0.02, true) / 60, 2.8);
ok("neoprene halfway, 20 mm sealed, min (answer: ~50)", half("neoprene", 0.02, true) / 60, 52);
ok("neoprene estimate w2/2a, h (answer: ~1.1)", 0.02 ** 2 / (2 * M.neoprene.a) / 3600, 1.15);
ok("foam/neoprene diffusivity ratio (answer: ~19x)", M.psfoam.a / M.neoprene.a, 18.5);
ok("foam steady leak, W/m2 (answer: ~53)", M.psfoam.lam * 30 / 0.02, 52.5);
ok("neoprene steady leak, W/m2 (answer: 180)", M.neoprene.lam * 30 / 0.02, 180);
ok("leak ratio (answer: 3.4x)", M.neoprene.lam / M.psfoam.lam, 3.43);
ok("glass a (slide 17: 5.6e-7)", M.glass.a, 5.6e-7);
ok("tea glass estimate, s (slide: 8)", 0.003 ** 2 / (2 * M.glass.a), 8);
ok("tea glass halfway sealed, s (answer: ~6)", half("glass", 0.003, true), 6.1);
ok("copper cup 3 mm halfway, s (answer: ~0.03)", half("cu", 0.003, true), 0.03, 0.1);
ok("copper/glass diffusivity ratio (answer: ~200x)", M.cu.a / M.glass.a, 205);
ok("neoprene 40 mm halfway, h (answer: ~3.5)", half("neoprene", 0.04, true) / 3600, 3.5);
// --- Flash
const th = (k, L) => P.FO_HALF_HELD * L * L / M[k].a;
ok("alumina 2 mm t1/2, s (answer: 0.052)", th("alumina", 0.002), 0.052);
ok("alumina a (answer: 1.07e-5)", M.alumina.a, 1.07e-5);
ok("alumina lambda back from a (answer: 33)", 0.139 * 0.002 ** 2 / 0.052 * 3980 * 775, 33);
ok("alumina 4 mm t1/2, s (answer: ~0.21)", th("alumina", 0.004), 0.21);
ok("mystery 2 mm t1/2, s (answer: ~0.14)", th("mystery", 0.002), 0.14);
ok("mystery a (answer: 4.0e-6)", M.mystery.a, 4.0e-6);
ok("iron/316 conductivity ratio (answer: five times)", 80 / M.mystery.lam, 5.0);
ok("glass 2 mm t1/2, s (answer: about a second)", th("glass", 0.002), 0.99);
ok("alumina/glass diffusivity ratio (answer: ~19x)", M.alumina.a / M.glass.a, 19);
// --- Chart rankings
const rank = (f, okf) => Object.keys(M).filter(k => !M[k].hidden && okf(M[k])).sort((a, b) => f(M[b]) - f(M[a]));
const storeR = rank(m => m.lam / Math.sqrt(m.a), m => m.a <= 3e-6);
console.log("  sun-wall order:", storeR.slice(0, 6).join(" > "));
if (storeR.slice(0, 6).join() !== "ti,stone,concrete,glass,adobe,brick") { fails++; console.log("  FAIL  sun-wall order differs from Ashby Table 5.26 (Ti > stone > concrete > glass > adobe ~ brick)"); }
ok("concrete/titanium sun-wall index (answer: roughly half)", Math.sqrt(M.concrete.lam * M.concrete.rhocp) / Math.sqrt(M.ti.lam * M.ti.rhocp), 0.47);
ok("stainless fails a <= 3e-6", M.ss.a > 3e-6 ? 1 : 0, 1, 0);
const kilnR = rank(m => Math.sqrt(m.a) / m.lam, m => m.tmax >= 1000);
console.log("  kiln order:", kilnR.slice(0, 4).join(" > "));
if (kilnR.slice(0, 2).join() !== "firebrick,aerated") { fails++; console.log("  FAIL  kiln order"); }
ok("refractory brick wall sqrt(2at), 3 h, mm (Table 5.28: ~100)", 1000 * Math.sqrt(2 * M.firebrick.a * 10800), 98);
ok("aerated concrete wall, mm (Table 5.28: ~110)", 1000 * Math.sqrt(2 * M.aerated.a * 10800), 96, 0.15);
const hourR = rank(m => 1 / m.a, m => m.a <= 0.02 ** 2 / 7200);
console.log("  one-hour survivors:", hourR.join(", "));
if (hourR.join() !== "neoprene") { fails++; console.log("  FAIL  one-hour survivors"); }
const monthR = rank(m => 1 / m.lam, () => true);
if (monthR.slice(0, 2).join() !== "psfoam,cork") { fails++; console.log("  FAIL  months order"); }
console.log(fails ? `\n${fails} FAILED` : "\nAll physics checks pass.");
process.exit(fails ? 1 : 0);
