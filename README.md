# ES 192 Heat Lab

Four short, hands-on scenes for **ES 192: Materials Selection in Mechanical Design** (Harvard SEAS), Week 11B, Thermal Design.

**Live page:** https://curiositaslabs.github.io/es192-heat-lab/

| | Scene | Link | The idea |
|---|---|---|---|
| 🔌 | Cool the chip | [#chip](https://curiositaslabs.github.io/es192-heat-lab/#chip) | ΔT = q·X/λ. Screen out metals (they short the chip), then rank on λ: aluminum nitride. |
| ✋ | Touch test | [#touch](https://curiositaslabs.github.io/es192-heat-lab/#touch) | Eight materials at the same temperature feel different: you feel the contact temperature, set by √(λρCp). Why sauna benches are wood. |
| ☕ | Hot-cup race | [#cup](https://curiositaslabs.github.io/es192-heat-lab/#cup) | Boiling water into copper, steel, glass and plastic cups at once. t ≈ x²/2a: twice the wall, four times as long. |
| 🏆 | Pick the wall | [#wall](https://curiositaslabs.github.io/es192-heat-lab/#wall) | One λ–a chart, four goals (months, one hour, sun wall, kiln). Drag the selection line; medals go to the winners. |

Each scene has a short lesson card: **Predict** → **Try it** → **Key idea**. Link to a step with `:n`, e.g. `#cup:2`. The 💡 **Key ideas** button shows all four ideas on one page. Keys: `1`–`4` switch scenes, `P` toggles Present mode.

## Embed in Canvas

```html
<iframe src="https://curiositaslabs.github.io/es192-heat-lab/#cup" width="100%" height="900" style="border:0" allowfullscreen title="ES 192 Heat Lab"></iframe>
```

## The models

- Chip: Fourier's law for a flat plate, as in Ashby, *Materials Selection in Mechanical Design* 6e, Exercise E2.22 (10 W on 1 mm², 2 mm plate, back face at 30 °C).
- Touch: the contact temperature of two solids pressed together, weighted by √(λρCp); finger at 33 °C. Valid for the first seconds of contact.
- Cup: exact solution of the heat equation for the wall (inside face jumps to 100 °C, outside face sealed); "Ouch" when the outside passes 60 °C.
- Chart: indices from Ashby Table C.7 and §§5.13–5.15; sun-wall costs from Table 5.26.
- Property data: one representative value per material, from Callister & Rethwisch 10e Table 19.1 and Appendix B, Ashby Table A.6 and p. 37, or typical values.

## Files and build

- `heat-lab.html` is the source; `python3 tools/build.py` writes `index.html`, the page GitHub Pages serves.
- `node tests/physics-test.js` runs the page's own physics code and checks every number quoted in the lesson cards.
- `tests/ui-test.js` and `tests/shots.js` drive headless Chrome through puppeteer-core (`cd tests && npm install`, then `npm test` or `npm run shots`).
