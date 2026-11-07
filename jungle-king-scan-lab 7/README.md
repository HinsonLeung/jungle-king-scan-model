# Jungle King Scan Lab

A minimal public website with a separate working prototype for connecting the systems before physical pieces are available. It uses plain HTML, CSS, and JavaScript, with no paid API or database. The ready-to-host `dist/` output needs no installation or build step. Development dependencies are only needed for tests and regenerating the test assets.

## Try it locally

With Node.js installed:

```sh
cd /Users/wonglikkiu/Documents/ChatGPT/Llab/jungle-king
npm run dev
```

Open http://localhost:5173 for the public website. Its white scanner page, sans-serif typography and open layout take their design direction from https://www.llab.co/. The top-right **EN / 繁中** control translates the scanner controls and animal cards, and remembers the selection. The main scanner offers a camera preview while product recognition is being prepared. No demo, QR or model-setup tools appear here, and test 3D placeholders are excluded.

Open http://localhost:5173/prototype.html for testing. The prototype starts with **QR test cards** selected. Open http://localhost:5173/qr-cards.html on another screen or print the eight cards. Enable the camera and click **Start QR scanning**. A code reveals only its matching animal card; foreign QR codes and empty scenes reveal nothing. A confirmed code pauses scanning. **Scan another piece** hides the card; start QR scanning again when ready. These codes work in this site's scanner and do not open a website through a phone's general camera app.

The prototype's tiger card includes an original animated 3D placeholder. Wait for it to load, play/pause its animation, and drag to rotate. **View in my space** appears on supported phones. Choose **EN** or **繁中** at the top right for the animal cards; the choice is shared with the main website and survives refresh. Prototype testing controls remain English. QR decoding identifies the printed code, not the appearance of a physical product.

For future appearance recognition, choose **Product scan** on the prototype, connect a trained model in **Scan setup**, enable the camera, and start recognition. Unknown or uncertain results hide the card. No trained model is supplied.

Without a model, expand **Prototype testing**, select **Demo scan**, choose an example, and click **Try demo scan**. Changing the example hides the previous card until another demo scan. All demo results are explicitly labelled and never claim to recognise the camera image. There is no animal gallery or manual profile-opening path.

## Connections implemented

```text
Demo result ──────────────────────────┐
Camera → exact QR test-card ID ────────┤
                                     ├─ piece ID → species.json → matching profile → illustration
Camera → crop → stable model result ──┘                                            └─ optional GLB / USDZ → AR
```

The camera, QR decoder, recognition adapter, label mapping, stable-result filter, scan-only card visibility, artwork preview, and 3D viewer are wired. QR, demo and model results use the same profile/asset pipeline. Eight game animals are identified from the user's campaign screenshots. Each profile contains sourced educational information and explicit conservation-assessment scope, with English and Traditional Chinese card content. The Aquatic Rat → European water vole identity remains provisional. See [RESEARCH.md](RESEARCH.md) for the evidence and limitations.

## Add a recognition model later

1. Train a **Standard Image Project** in https://teachablemachine.withgoogle.com/ using real product photos. Include varied photo sessions and test using sessions withheld from training.
2. Use `elephant_piece`, `lion_piece`, `tiger_piece`, `leopard_piece`, `bear_piece`, `dog_piece`, `cat_piece`, `rat_piece`, and `other`. Exact aliases are in `dist/species.json`. Unknown/unmapped winning labels are rejected. Confirm the Aquatic Rat identity before finalising its content mapping.
3. Export **TensorFlow.js** and download `model.json`, `metadata.json`, and the single `.bin` weights file.
4. In **Scan setup**, select all three files together. Files are read in the browser, not uploaded to a backend. Or place the exported files in `dist/models/recognition/` and connect `/models/recognition/`. A hosted Teachable Machine folder URL also works if cross-origin loading is permitted.
5. Choose **Product scan**, enable the camera, and click **Start live recognition**. See [training/README.md](training/README.md) for the collection/split plan and empty nine-class photo folders.

After validating the model in the prototype, set `recognitionModelFolder` in `dist/site-config.js` to its folder URL (for example `/models/recognition/`). The main website then connects it automatically and shows **Scan piece**. Leave the value `null` until a real model is ready. The public page uses the same confidence and stability filters as the prototype, and shows only confirmed matching animal stories.

Inference uses the visible centre square and runs serially about four times per second. Defaults require a score of at least 0.85, a margin of at least 0.15 above the runner-up, and four consecutive matching frames. Scores are model outputs, not guarantees of correctness. Calibrate these settings against real phone tests. A single-piece classifier does not detect multiple pieces or estimate their positions.

The runtime uses the compatible script versions from Google's documented example: TensorFlow.js 1.3.1 and Teachable Machine image library 0.8.3. These load from jsDelivr only when a model is connected. A real model and real devices are needed to validate runtime compatibility and accuracy; none is supplied or fabricated.

## Add reviewed animal information

Edit `dist/species.json` for English content and `dist/content.js` for matching Traditional Chinese translations. The eight profiles contain sourced summaries, scientific identities, habitat, threats, protection, and facts. Each conservation category has an explicit `scope`, optional `secondary` categories, and source links. The `checkedOn` research date is separate from the assessment date. Keep `assessmentDate: null` where it has not been verified. `reviewed: true` records the previous source review, not expert certification. Translation does not reset the source-check date. `mappingStatus: provisional` keeps the Aquatic Rat warning visible in both languages. Do not apply regional categories to an entire global species.

## Add animated 3D and AR

Create assets with free Blender or obtain assets with permission. Put GLB and optional USDZ files in `dist/models/` and set their paths in the corresponding profile:

```json
"assets": { "glb": "/models/tiger.glb", "usdz": "/models/tiger.usdz" }
```

The GLB should use real product dimensions in metres. The website lazy-loads the locally bundled model-viewer 4.1.0, displays the model, plays an embedded animation when available, and offers its native AR button on supported devices. A supplied USDZ is passed to Apple Quick Look. Without one, model-viewer can generate a USDZ; this may be static. Test on-page animation and each device's AR animation separately. Precise tracking of a moving piece is outside this prototype.

`dist/models/tiger-test.glb` is an original CC0 geometric tiger, about 13 cm long, with breathing, head nod and tail sway animation. It is explicitly a placeholder, not a product replica. Seven animals retain the labelled static-artwork motion preview. See [dist/models/README.md](dist/models/README.md). No final animal assets or product measurements are claimed.

Test placeholders and artwork-motion controls appear only on the prototype. When replacing the tiger test asset with a final model, remove its `assets.placeholder` flag so the main website can display that model after a confirmed scan.

## Free hosting

The `dist/` directory is a ready-to-upload static website. It can be uploaded to Cloudflare Pages Free with the provider's supplied address, without a custom domain or server-side functions. Each file must fit the hosting limits (Cloudflare Pages currently allows 25 MiB per asset). HTTPS is necessary for camera use on phones; opening the files directly or using a phone's plain HTTP LAN URL will not provide camera access. A private preview may require account sign-in. Open it in a full browser if embedded preview permissions block camera access.

## Checks

```sh
npm test
```

Run `npm ci` before development checks. Unit checks cover profiles, conservation scopes, provisional identity, prediction rejection/stability, exact QR routing, Chinese content coverage and validation of the animated GLB with the Khronos validator.

Run `npm run test:browser` when Playwright and Chrome are available (optional `PLAYWRIGHT_MODULE`, `CHROME_PATH`, `SCAN_LAB_URL` for the prototype and `PUBLIC_SITE_URL` for the main page). The server must be running. The original browser suite tests demos and stub predictions. The QR/3D suite uses the real ZXing decoder on generated QR camera-stream frames and the real model-viewer for GLB load, animation and rotation, plus language persistence, mobile layout, repeated scans, cleanup and simulated permission denial. The page-separation suite covers the main website, top-right language controls, navigation, camera preview and a simulated configured model, including exclusion of test placeholders. Generated streams and stub predictions do not establish physical camera behaviour or recognition accuracy. Follow [PHONE-TESTS.md](PHONE-TESTS.md) on actual iPhone/Android devices; AR remains unverified.

Regenerate the eight PNG codes, printable page, GLB and local library copies with `npm run build:test-assets`. Versions are pinned; the generated output remains a standalone static site.

## Files

- `dist/index.html`, `website.css`: minimal white public scanner website.
- `dist/prototype.html`, `styles.css`: separate test page and shared scanner/card styling.
- `dist/components.js`: shared animal-result markup.
- `dist/site-config.js`: optional validated recognition model for the public website.
- `dist/app.js`: camera lifecycle, demo/model adapters, profile rendering, and optional AR viewer.
- `dist/content.js`: English card labels and Traditional Chinese card translations.
- `dist/qr-cards.html`, `qr-cards.css`, `assets/qr/`: printable bilingual QR test cards.
- `dist/vendor/`: locally bundled QR/3D libraries and licenses.
- `scripts/build-test-assets.mjs`: reproducible QR and original GLB generator.
- `dist/pipeline.js`: recognition filtering and ID mapping.
- `dist/species.json`: editable data and asset connections.
- `dist/assets/game-animals-*.png`: unchanged campaign screenshots supplied by the user, displayed in CSS frames.
- `dist/assets/animals.svg`: original empty-state placeholder illustration.
- `RESEARCH.md`: conservation sources, identity notes, and campaign-access limitations.
- `server.mjs`: local preview server, bound to loopback.
- `SYSTEM-STATUS.md`, `REVIEW.md`, `PHONE-TESTS.md`, `training/`: current review, validation limits and remaining work.

Reference APIs: https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image and https://modelviewer.dev/.
