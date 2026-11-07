# System status · 14 October 2026

The prototype supports a test journey without physical products: **camera QR scan → matching bilingual animal card → tiger 3D animation → optional phone AR**. Product appearance recognition still needs real photos and a trained model. Phone AR placement and AR animation are not yet validated.

The public website at `/` now uses an llab.co-inspired minimal white scanner layout. The top-right language control translates the public copy and animal cards. `/prototype.html` contains QR/demo scans, recognition setup and the test tiger; the main website excludes those testing tools and placeholders. `dist/site-config.js` is ready for a validated model folder and remains unconfigured.

| Requirement | Current implementation | Still needed |
| --- | --- | --- |
| Mobile website | Separate public/prototype pages, llab.co-inspired minimal design, top-right English/Traditional Chinese switch | Final editorial review and physical phone tests |
| Camera | Browser permission, live preview, rear-camera preference, start/stop lifecycle | Actual iPhone/Android camera, permission and recovery checks |
| QR testing | Eight printable codes; real ZXing decoding; exact versioned ID routing; foreign-code rejection; pause on match; reset/repeat | Tests with printed cards and phone cameras |
| Product recognition | Teachable Machine file/folder loader, visible crop, score/margin filters and consecutive-frame confirmation | Real product photos, trained model, independent accuracy tests and calibration |
| Animal mapping | Eight campaign-based piece IDs | Designer confirmation of Aquatic Rat → European water vole |
| Animal content | Eight sourced English cards and Traditional Chinese translations; scopes, sources and dates preserved | Bilingual editorial review; periodic external source audit; unverified primary assessment dates |
| Animation | One original animated tiger GLB, validated with Khronos; seven labelled artwork-motion previews | Final animated animal/product models |
| 3D viewer | Real model-viewer loading, embedded play/pause and rotation | Real phone performance tests and product dimensions |
| Tabletop AR | model-viewer WebXR / Android Scene Viewer / iOS Quick Look connections; auto-generated USDZ path if no ios-src | Actual phone AR placement, scale and separate animation tests; generated USDZ may be static |
| Moving-piece / board tracking | Not implemented | Object/marker tracking and calibration if requested |
| Training preparation | Nine classes in separate empty train/validation/test folders; session log and collection plan | Photos from independent sessions, trained model and measured test results |
| Hosting | Portable dist/ static output; existing hosting configuration | Deploy the updated output to HTTPS for phone testing; hosted deployment is not verified here |
| Git | Website and prototype changes maintained on the Nicholas development branch | Hosting publication and verification remain separate from source updates |

## Validation

`npm test` covers profile/mapping rejection and stability, assessment scope, provisional identity, exact QR payloads, Chinese coverage and animated GLB validation. `npm run test:browser` covers the real decoder with generated camera-stream cards, the real 3D viewer, demos and stub inference, reset/cleanup, language persistence, responsive layouts and simulated camera denial. It also checks public/prototype separation and future-model wiring without exposing test placeholders on the main page. See `REVIEW.md` for the recorded outcome and `PHONE-TESTS.md` for unperformed physical-device checks.

No product-recognition accuracy, hardware-camera compatibility, final product scale or mobile AR success is claimed. Source check dates remain 9 October 2026; adding translations is not a new source audit.

## Next actions

1. Deploy the updated static output to an HTTPS preview and run the iPhone/Android checklist using the QR cards.
2. Confirm the Aquatic Rat identity and review the bilingual wording.
3. Replace the tiger placeholder with one correctly scaled final animal/product model; verify native AR separately before creating the other seven.
4. When products arrive, collect independent photo sessions and follow `training/README.md` before training or claiming recognition accuracy.

All development uses free libraries and tools. No paid API, backend, database or subscription is required. See `README.md` for local preview and asset regeneration.
