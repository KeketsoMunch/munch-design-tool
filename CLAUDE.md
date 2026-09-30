# CLAUDE.md

Munch Design Tools: a client-only React SPA of interactive design-system utilities (border radius, color palettes, APCA contrast, token-driven components). No backend, no tests.

## Commands

```bash
npm install        # package-lock.json is the lockfile in use (yarn.lock is stale)
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # production build to dist/ (expect a >500 kB chunk-size warning; antd is not code-split)
npm run lint       # ESLint 9 flat config; must pass with zero errors before committing
npm run preview    # serve the built dist/
```

There is no test suite. Verify changes with `npm run lint`, `npm run build`, and by opening the affected tab in the dev server and checking the browser console for errors.

## Stack

- React 19, Vite 7 (`@vitejs/plugin-react`), plain JavaScript/JSX (no TypeScript)
- Ant Design 5 for all UI (`Card`, `Row`/`Col`, `Slider`, `Typography`, `message`, …)
- `@ant-design/icons` for icons. It is imported everywhere but comes in transitively through `antd`; it is not a direct dependency in `package.json`.

## Layout

```
src/
├── main.jsx                 # entry; renders <App/> in StrictMode
├── App.jsx                  # page switcher: useState('radius') + switch on currentPage (no router)
├── index.css                # global styles (leftover Vite starter base; antd handles most styling)
├── components/
│   ├── Navigation.jsx       # antd horizontal Menu; menu item keys must match App.jsx cases
│   ├── RadiusVisualizer.jsx # 'radius'     outer radius = inner radius + padding demo
│   ├── ColorPalette.jsx     # 'palette'    main tool (~1100 lines), see below
│   ├── APCAContrast.jsx     # 'apca'       contrast checker + text scenario previews
│   ├── Components.jsx       # 'components' IconComponent driven by design tokens
│   └── ApiTools.jsx         # 'api'        mock API docs; routed in App.jsx but NOT in the nav menu
└── data/
    └── system-studio-semantics-flat.json  # flat map of CSS custom properties -> hex
                                           # e.g. "--system-fg-primary": "#..."
```

### Adding a page
1. Create `src/components/<Name>.jsx` with a default export.
2. Add a `case '<key>'` in `App.jsx` `renderContent()`.
3. Add a `{ key, icon, label }` entry to `menuItems` in `Navigation.jsx`.

## Conventions

- Function components with hooks. Each file holds one page component; helpers are defined inside the component.
- Styling is mostly inline `style={{…}}` objects plus antd props; there are no CSS modules or styled components. Pages wrap content in `<div style={{ padding: '24px', maxWidth: …, margin: '0 auto' }}><Card>…`. Use `styles={{ body: … }}` on antd `Card`, not the deprecated `bodyStyle`.
- User feedback uses antd `message.success/error/warning`. Clipboard uses `navigator.clipboard.writeText`.
- Lint rule: `no-unused-vars` ignores vars and args matching `^[A-Z_]`. Capitalized names are treated as used because there is no `eslint-plugin-react` to track JSX usage. Remove other unused imports, params, and catch bindings instead of disabling the rule (use `catch {` when the error is unused).
- Commit messages are short imperative summaries ("Add APCA Contrast Checker", "Fix duplicate keys error in color palette").

## ColorPalette.jsx notes

- Color math is hand-rolled HSL (`hexToHsl`, `hslToHex`). The palette is `palettePoints` (`{ shade, lightness }`, default shades 50…950). Each point's color is base hue/saturation plus the Hue/Saturation shift, and its lightness is clamped to `[lightnessMin, lightnessMax]`.
- The SVG graph uses a fixed 800×300 viewBox. The x-axis maps shade 0–2100 to x 50–750 and the y-axis maps lightness 0–100 to y 250–50. Points drag vertically only (mouse events, no touch).
- `catmullRomSpline` / `generateLightnessCurve` interpolate the curve and pick the lightness for newly added points.
- Config JSON (Save/Load, Copy with Config) contains `name`, `colors`, `config{…}`, `palettePoints`, `curveIntensity`, and `connectionStrength`. It also reads the legacy `graphPoints` key when loading.
- Stored and exported but **not used in generation**: `minRange`/`maxRange`, `customRanges`/`useCustomRanges`, `isPerceived`, `curveIntensity`, `connectionStrength`. The CSS/SCSS/Tailwind export buttons are disabled. The "Demo" and "Add Palette" buttons have no handlers.

## Known issues / caveats

- `APCAContrast.jsx` `calculateAPCA` is a simplified luminance-difference approximation, **not** the real APCA (SAPC) formula. `getAPCAGuideline` ignores font size and weight.
- The palette swatch text color is chosen by `shade > 500`, not by the swatch's actual lightness. The base-hex input accepts invalid values, which can produce `NaN` colors.
- `Navigation.jsx` has a placeholder star count ("1121") and a GitHub link to `https://github.com`.
- `package.json` name is still `vite-react-starter`, the `index.html` title is "Vite + React", and README.md is out of date (it doesn't cover APCA or Components).
