// Runs the page's own physics block (between /*PHYSICS-START*/ and /*PHYSICS-END*/) and checks every number
// quoted in the lesson cards. Usage: node tests/physics-test.js
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "heat-lab.html"), "utf8");
const block = src.split("/*PHYSICS-START*/")[1].split("/*PHYSICS-END*/")[0];
const P = new Function(block + "; return {slabTheta, FO_HALF, contactT, chipT, cupOuchTime, MATS};")();
const M = P.MATS;
let fails = 0;
function ok(name, got, want, tol = 0.05) {
  const good = Math.abs(got - want) <= tol * Math.abs(want);
  if (!good) fails++;
  console.log((good ? "  ok  " : "  FAIL") + "  " + name.padEnd(60) + " " + (+got.toPrecision(4)) + "   (expect " + want + ")");
}
function check(name, cond) { if (!cond) fails++; console.log((cond ? "  ok  " : "  FAIL") + "  " + name); }
// exact solution: the two forms agree at the switch, and the far-face halfway Fourier number
for (const xi of [0.3, 0.7, 1]) ok("continuity at Fo = 0.05, xi = " + xi, P.slabTheta(xi, 0.0499999) + 1, P.slabTheta(xi, 0.0500001) + 1, 1e-4);
ok("far face halfway, Fourier number", P.FO_HALF, 0.379, 0.01);
ok("sealed slab uniform at Fo = 5", P.slabTheta(1, 5), 1, 1e-3);
// Chip (11B slide 6, Ashby E2.22)
ok("chip on 2 mm AlN, C (card: about 150)", P.chipT(M.aln, 2), 148);
ok("chip on 2 mm alumina, C (card: about 640)", P.chipT(M.alumina, 2), 636);
ok("thickest AlN plate under 100 C, mm (slider reaches it)", (100 - 30) * M.aln.lam / 1e7 * 1000, 1.19);
// Touch test
ok("steel at 0 C feels, C (card: about 4)", P.contactT(M.steel, 0), 4.0);
ok("wood at 0 C feels, C (card: about 26)", P.contactT(M.wood, 0), 25.8);
ok("wood at 80 C feels, C (card: about 43)", P.contactT(M.wood, 80), 43.3);
ok("stone at 80 C feels, C (card: about 66)", P.contactT(M.stone, 80), 65.6);
ok("steel at 80 C feels, C (card: about 74)", P.contactT(M.steel, 80), 74.3);
check("at 33 C everything feels 33 C", Object.values(M).every(m => Math.abs(P.contactT(m, 33) - 33) < 1e-9));
// Cup race
ok("glass a (11B slide 17: 5.6e-7)", M.glass.a, 5.6e-7);
ok("glass 3 mm estimate x^2/2a, s (card: 8)", 0.003 ** 2 / (2 * M.glass.a), 8);
ok("glass 3 mm held, s (card: about 6)", P.cupOuchTime(M.glass, 3), 6.1);
ok("glass 6 mm held, s (card: about 24)", P.cupOuchTime(M.glass, 6), 24.3);
check("plastic at 3 mm is under a minute", P.cupOuchTime(M.plastic, 3) < 60);
check("plastic at 3.5 mm is over a minute (card: about 3.5 mm or more)", P.cupOuchTime(M.plastic, 3.5) >= 60);
check("no other cup reaches a minute at 6 mm", ["cu", "steel", "glass"].every(k => P.cupOuchTime(M[k], 6) < 60));
ok("copper/plastic diffusivity ratio (card: about 1,700)", M.cu.a / M.plastic.a, 1670);
// Chart
const rank = (f, okf) => Object.keys(M).filter(k => ["cu","al","aln","alumina","steel","ti","stone","concrete","glass","adobe","brick","aerated","firebrick","neoprene","cork","foam"].includes(k) && okf(M[k])).sort((a, b) => f(M[b]) - f(M[a]));
const months = rank(m => 1 / m.lam, () => true), hour = rank(m => 1 / m.a, m => m.a <= 0.02 ** 2 / 7200);
const store = rank(m => m.lam / Math.sqrt(m.a), m => m.a <= 3e-6), kiln = rank(m => Math.sqrt(m.a) / m.lam, m => m.tmax >= 1000);
console.log("  months:", months.slice(0, 3).join(" > "), "| hour:", hour.join(", "), "| store:", store.slice(0, 6).join(" > "), "| kiln:", kiln.slice(0, 3).join(" > "));
check("months: foam then cork", months.slice(0, 2).join() === "foam,cork");
check("hour: only rubber survives", hour.join() === "neoprene");
check("store: Ashby Table 5.26 order", store.slice(0, 6).join() === "ti,stone,concrete,glass,adobe,brick");
check("kiln: refractory brick, then aerated concrete", kiln.slice(0, 2).join() === "firebrick,aerated");
check("foam has the best kiln index of all (card premise)", rank(m => Math.sqrt(m.a) / m.lam, () => true)[0] === "foam");
ok("concrete/titanium sun-wall index (card: half)", M.concrete.e / M.ti.e, 0.47);
ok("rubber a (Ashby reads 5e-8)", M.neoprene.a, 5e-8);
console.log(fails ? `\n${fails} FAILED` : "\nAll physics checks pass.");
process.exit(fails ? 1 : 0);
