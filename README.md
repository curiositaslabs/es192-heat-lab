# ES 192 Heat Lab

Interactive heat-flow models for **ES 192: Materials Selection in Mechanical Design** (Harvard SEAS), Week 11B, Thermal Design: Heat Flow and Transient Response.

**Live page:** https://curiositaslabs.github.io/es192-heat-lab/

| # | Bench | Link | What it shows |
|---|---|---|---|
| 1 | Chip heat sink | [#chip](https://curiositaslabs.github.io/es192-heat-lab/#chip) | Fourier's law, ΔT = qX/λ, for a 10 W chip on 1 mm². Screen out electrical conductors, rank on λ: aluminum nitride. |
| 2 | Steady or changing? | [#wall](https://curiositaslabs.github.io/es192-heat-lab/#wall) | Two walls side by side after a sudden outside temperature change. Steady leak is set by λ; delay is set by diffusivity a. The front moves as √(2at). Covers short-term insulation (foam vs neoprene), the cold room and the tea glass. |
| 3 | Laser flash | [#flash](https://curiositaslabs.github.io/es192-heat-lab/#flash) | Flash one face of a disc, read t½ off the back-face curve, compute a ≈ 0.139 L²/t½ and λ = aρCp. Includes a mystery sample. |
| 4 | Selection chart | [#chart](https://curiositaslabs.github.io/es192-heat-lab/#chart) | λ against a with a movable selection line for four goals: insulate for months (min λ), for an hour (min a), store the day's heat (max λ/a½, a ≤ 3 × 10⁻⁶) and a kiln wall (max a½/λ at 1000 °C). |

## Using it in class

- **Explore questions.** Each bench has a short set of questions. **Set it up** puts the model in the state the question needs; **Show answer** reveals the answer. The link button copies a link that opens that question already set up.
- **Links to a question:** add `:n` to a bench link, e.g. `#wall:1` (the beacon: foam vs neoprene), `#wall:3` (tea glass), `#flash:3` (mystery sample), `#chart:2` (sun wall).
- **Keys:** `1`–`4` switch benches, `P` toggles Present mode (full screen, larger text).
- **Light/dark:** the moon button.

## Embed in Canvas

```html
<iframe src="https://curiositaslabs.github.io/es192-heat-lab/#wall" width="100%" height="900" style="border:0" allowfullscreen title="ES 192 Heat Lab"></iframe>
```

## The models

- All temperatures are exact one-dimensional solutions of the heat equation (Fourier series, with image sums at short times), not animations. Bench 3 uses Parker's flash solution (Parker et al., *J. Appl. Phys.* 32, 1679, 1961).
- Property data are one representative value per material: Callister & Rethwisch, *Materials Science and Engineering* 10e, Table 19.1 and Appendix B; Ashby, *Materials Selection in Mechanical Design* 6e, Table A.6, p. 37, §§5.13–5.18 and Tables 5.24–5.28. Each bench's "About" panel lists its sources.
- The estimate t ≈ w²/2a is an order-of-magnitude guide; the exact halfway time is about 0.76 × that for a sealed wall.

## Files and build

- `heat-lab.html` is the source (no `<html>`/`<head>` wrapper). `python3 tools/build.py` writes `index.html`, the page GitHub Pages serves.
- `tests/physics-test.js` runs the page's own physics code and checks every number quoted in the Explore answers (`node tests/physics-test.js`).
- `tests/ui-test.js` and `tests/shots.js` drive headless Chrome through puppeteer-core (`cd tests && npm install`, then `npm test` or `npm run shots`); screenshots go to `tests/out/`.
