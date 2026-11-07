# Current-project review · 14 October 2026

Reviewed the current `jungle-king` checkout on its existing `Nicholas` branch: application, profile data, camera and recognition lifecycle, viewer connections, tests, static output, source notes and hosting configuration. The unrelated `assignment-1-chart` project was outside this review.

The original eight-profile pipeline was working under its existing checks. The project had no trained product model and no GLB/USDZ assets. Earlier research notes still described a browsing/search gallery removed from the current scanner-first interface. No external conservation-source re-audit or hosted-site comparison was performed; source-check dates remain 9 October 2026.

## Work completed while training is on hold

- Added a default QR camera mode using locally bundled ZXing Browser 0.1.5. Each of eight generated PNG cards carries an exact versioned piece ID. Only a matching test payload reveals one profile; unrelated QR content is rejected. A confirmed scan pauses decoding, and reset/repeat retains the existing camera stream.
- Added a printable bilingual test-card page at `dist/qr-cards.html`. QR payloads are for this website's scanner, not external URLs. Used raster output after real decoder checks found SVG module rounding could prevent reliable decoding of two generated cards.
- Added an original animated geometric tiger GLB, connected only to the tiger profile. It is approximately 13 cm long and explicitly a test placeholder, not a product replica. The other seven animals retain the labelled artwork-motion preview.
- Added English/Traditional Chinese animal-card switching, persisted in local storage. All eight summaries, habitats, threats, conservation scopes, protection notes and facts are translated. The Aquatic Rat caveat remains visible in both languages. Public scanner controls are translated; prototype testing controls remain English.
- Fixed 3D source/loading/reset state, disabled animation while loading, protected asynchronous asset connection from stale results, and allowed retry after a failed ES-module download. Viewer/scanner libraries and licenses ship inside the static output.
- Added a real-phone acceptance checklist, nine-class training/validation/test folder structure, session log and independent-session photo plan. Raw photos are ignored by Git.
- Corrected outdated README, research and system-status claims. Kept recognition training, final 3D production and mobile AR verification as outstanding work.
- Separated the public website (`/`) from QR/demo/model testing (`/prototype.html`). Moved language controls to the top right on both pages. The public page uses llab.co's sans-serif typography and spacious layout as a reference. The welcome section and pastel gradient were removed at the user's request; only the white scanner page remains.
- Added optional public model configuration, bilingual public camera/status messages and guards for prototype-only controls. The main website excludes placeholder GLBs and keeps animal cards hidden until a confirmed product-model result.

## Recorded checks

| Check | Result | What it establishes |
| --- | --- | --- |
| `npm test` | 12 passed | Eight profiles, source scopes and mapping rules, unknown/ambiguous rejection, prediction stability, exact QR routing, Chinese content coverage and Khronos GLB validation |
| Animated GLB validator | 0 errors, 0 warnings | Self-contained valid glTF 2.0 binary with three animation channels |
| Original browser suite | Passed | Eight demos, scanner-first visibility/reset, mobile layout, simulated camera lifecycle, four-frame confirmation and unknown/uncertain rejection with stub model predictions |
| QR/3D browser suite | Passed | Real QR decoder with all eight generated-camera-stream cards, foreign/empty rejection, repeat/reset, camera cleanup, bilingual switching/persistence, real GLB loading/play/pause/drag rotation, narrow portrait/landscape layouts, simulated permission denial and library failure/retry |
| Main/prototype browser suite | Passed | Separation of public and test tools, top-right language control at 1280/390/320/844 px, bilingual copy/persistence, camera preview/cleanup, navigation, simulated configured model confirmation/rejection and exclusion of placeholder GLBs |
| Visual review | Passed | Public white scanner page on desktop and Traditional Chinese mobile; prototype animal card, rendered tiger and printable eight-card layout. Public screenshots: `/private/tmp/jungle-website-desktop.png`, `/private/tmp/jungle-website-mobile-zh.png`; prototype screenshots: `/private/tmp/jungle-qr-*.png` and `/private/tmp/jungle-tiger-viewer.png` |
| Syntax / `git diff --check` | Passed | No checked syntax or whitespace errors |

The simulated camera sends real generated QR images through a browser MediaStream, then the production QR decoder processes those video frames. It does not prove physical camera focus, printed-card readability or hardware permission behaviour. Model predictions in the old suite are stubs and do not establish ML accuracy.

## Outstanding work

1. Deploy this updated static output to an HTTPS preview and run `PHONE-TESTS.md` on iPhone and Android. AR placement, orientation, scale and animation need separate results. Automatically generated iOS USDZ may be static; on-page GLB animation does not establish native AR animation support.
2. Obtain designer confirmation that Aquatic Rat means European water vole and complete bilingual editorial review. Recheck conservation sources before final publication.
3. Obtain measured dimensions and final permitted models. Verify one final model on phones before producing the other seven.
4. Collect real product photos from separate sessions and follow `training/README.md`. Train, calibrate and report independent test performance before calling product recognition ready.

These changes are maintained on the `Nicholas` development branch. GitHub source updates and deployment of the hosted preview are separate actions; this review does not verify a hosted deployment. The local preview server runs at `http://localhost:5173` on this computer.
