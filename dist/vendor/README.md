# Bundled browser libraries

These unmodified release files ship with the static site so QR tests and 3D viewing do not need to fetch their main libraries from a CDN.

- ZXing Browser 0.1.5: https://github.com/zxing-js/browser (MIT). Its bundle includes ZXing Library (Apache 2.0), text-encoding (Apache 2.0), and ts-custom-error (MIT).
- Google model-viewer 4.1.0: https://github.com/google/model-viewer (Apache 2.0). The bundle preserves embedded license notices and includes Three.js (MIT), Lit (BSD 3-Clause), and gainmap-js (MIT).

License texts are included alongside the bundles. Rebuild with `npm ci` and `npm run build:test-assets`; versions are pinned in package-lock.json. Recognition libraries still load from the documented Teachable Machine CDN when connecting a trained model. Native AR services may need a network connection.
