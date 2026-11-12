# ES 192 Heat Lab

Four realistic, hands-on 3D scenes for **ES 192: Materials Selection in Mechanical Design** (Harvard SEAS), Week 11B, Thermal Design.

**Live page:** https://curiositaslabs.github.io/es192-heat-lab/

| | Scene | Link | The idea |
|---|---|---|---|
| 🔌 | Cool the chip | [#chip](https://curiositaslabs.github.io/es192-heat-lab/#chip) | A power-module stack: silicon die, aluminum bond wires and copper pads on the substrate you choose, on a water-cooled plate. ΔT = q·X/λ. Metals short the chip (sparks); weak conductors overheat it (smoke); aluminum nitride works. |
| ✋ | Touch test | [#touch](https://curiositaslabs.github.io/es192-heat-lab/#touch) | A fingertip on a block of copper, aluminum, steel, granite, glass, polypropylene, pine or foam at any temperature. You feel the contact temperature, set by √(λρCp). Why sauna benches are wood. |
| ☕ | Hot-cup race | [#cup](https://curiositaslabs.github.io/es192-heat-lab/#cup) | Boiling tea poured into copper, stainless-steel, glass and polypropylene tumblers at once. t ≈ x²/2a: twice the wall, four times as long. |
| 🏆 | Pick the wall | [#wall](https://curiositaslabs.github.io/es192-heat-lab/#wall) | An Ashby chart of λ against a, with property-range bubbles and family envelopes, four design goals, a draggable selection line and medals. |

**📷 Thermal camera:** the chip, touch and cup scenes switch to an infrared view (iron palette, temperature scale, spot meter) that shows the true surface temperature.

Each scene has a short lesson card: **Predict** → **Try it** → **Key idea**. Link to a step with `:n`, e.g. `#cup:2`. The 💡 **Key ideas** button shows all four ideas on one page. Drag a 3D scene to look around. Keys: `1`–`4` switch scenes, `P` toggles Present mode.

## Embed in Canvas

```html
<iframe src="https://curiositaslabs.github.io/es192-heat-lab/#cup" width="100%" height="900" style="border:0" allowfullscreen title="ES 192 Heat Lab"></iframe>
```

## The models

- Chip: Fourier's law for a flat plate, as in Ashby, *Materials Selection in Mechanical Design* 6e, Exercise E2.22 (10 W on 1 mm², 2 mm substrate, cooled face at 30 °C). The thermal view spreads that temperature across the substrate for display.
- Touch: the contact temperature of two solids pressed together, weighted by √(λρCp); finger at 33 °C. Valid for the first seconds of contact.
- Cup: exact solution of the heat equation for the wall (inside face jumps to 100 °C, outside face sealed); too hot to hold when the outside passes 60 °C.
- Chart: indices from Ashby Table C.7 and §§5.13–5.15; sun-wall costs from Table 5.26; bubble sizes are typical property ranges.
- Property data: one representative value per material, from Callister & Rethwisch 10e Table 19.1 and Appendix B, Ashby Table A.6 and p. 37, or typical values.

## Credits

3D rendering: [three.js](https://threejs.org) r160 (MIT). Studio HDRI *Studio Small 09* (Sergej Majboroda) and the *Oak Veneer 01* and *Coated Pine* textures: [Poly Haven](https://polyhaven.com), CC0. All other textures (brushed metal, granite, foam beads, silicon die, skin) are generated in the page.

## Files and build

- `heat-lab.html` is the source; `python3 tools/build.py` writes `index.html`, the page GitHub Pages serves. `assets/` holds the HDRI and wood textures.
- `node tests/physics-test.js` runs the page's own physics code and checks every number quoted in the lesson cards.
- `tests/ui-test.js`, `tests/shots.js` and `tests/snap.js` drive headless Chrome through puppeteer-core over a small local server (`tests/serve.js`); `cd tests && npm install`, then `npm test`.
