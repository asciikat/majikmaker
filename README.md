# Majik Maker

An installable web app for phone and desktop. Upload a vision image, write an intention, choose a geometry, and create a personal sigil. Export it as a 1600 × 1600 PNG or scalable SVG. On supported phones, “Save image” opens the native file-sharing sheet.

The symbol is generated entirely on your device from your image’s sampled pixels, luminance, contrast, color balance, and intention text. Orbital, Resonance, and Entangled modes draw on the visual language of orbits, waves, and connected forms. Quantum physics does not establish that symbols or thoughts manifest objects or influence external events; this is a creative practice for reflection and visualization.

## Run locally

Install Node.js 20 or later, then run:

```sh
npm start
```

Open `http://127.0.0.1:4173`. No dependency installation, build, API key, or backend is required. Opening `app/index.html` directly allows basic editing, but installation, service workers, and the example photo require the local server or an HTTPS host.

## Install on phone or desktop

Open the hosted HTTPS app and select **Install app** for instructions.

- **iPhone / iPad:** open in Safari → Share → Add to Home Screen.
- **Android:** open in Chrome → Install app / Add to Home screen.
- **Windows / Linux / macOS:** use Chrome or Edge’s install option.
- **macOS Sonoma or later:** Safari → File → Add to Dock.

This is a progressive web app (PWA), rather than an App Store package. It launches in its own window where the browser supports installation. After one successful online visit completes the service-worker cache, the app can reopen and generate symbols offline. Device photos, intentions, and generated symbols remain in memory and clear when the app is closed or refreshed; download anything you want to keep. No photo is uploaded or automatically saved.

## Deploy to GitHub Pages

The included GitHub Actions workflow publishes the `app/` directory. In this repository’s **Settings → Pages**, select **GitHub Actions** as the source, then run **Deploy Majik Maker** from the Actions tab (or push a change to `main`). The repository must allow Pages and the Pages deployment environment.

Relative paths allow deployment at `/majikmaker/` or at a domain root. Once Pages reports a successful deployment, use its displayed URL to open and install the app. Other static HTTPS hosts can serve `app/` unchanged.

## Development

```sh
npm run check
npm test
```

`app/symbol.js` contains the deterministic geometric generator. `app/app.js` handles browser-only image processing and exports. `app/install.js` handles install prompts and device instructions. `app/sw.js` caches the app shell and local assets. Bump `CACHE_NAME` in `app/sw.js` whenever shipped assets change.

Automated checks cover symbol determinism and variation, SVG integrity, service-worker install/activation/fetch behavior, scoped offline navigation, asset completeness, and manifest paths. Native installation and iOS file sharing still need verification on real devices; a browser automation run was unavailable in the build environment.

The bundled dream-home image is an AI-generated example, not a photo of an identified property.
