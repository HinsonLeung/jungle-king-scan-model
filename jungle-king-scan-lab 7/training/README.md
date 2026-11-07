# Future product-photo training

No photos or trained model are supplied. The empty `photos/train`, `photos/validation` and `photos/test` folders contain all eight piece IDs plus `other`. The classification labels must stay exactly:

`elephant_piece`, `lion_piece`, `tiger_piece`, `leopard_piece`, `bear_piece`, `dog_piece`, `cat_piece`, `rat_piece`, `other`.

The rat class identifies the physical piece; its biological species mapping remains provisional. Do not use QR cards, campaign screenshots or the generated 3D placeholder as product-recognition training photos.

## Collection sessions

- Photograph one actual piece per frame, with roughly balanced coverage for each animal. Include the top, front, back, sides and oblique angles; different distances and rotations; portrait/landscape; normal phone cameras; hands and tabletop placement.
- Vary daylight and warm/cool indoor light, light/dark/patterned backgrounds, shadows, reflections and moderate occlusion. Photograph every animal across these conditions so background or photographer does not reveal the class.
- For `other`, collect empty tables, hands without a piece, packaging, unrelated objects, QR cards, very obscured pieces and multiple-piece scenes. An `other` class improves rejection but does not turn a single-image classifier into a multi-object detector.
- Use a session ID such as `2026-11-01-phone-a-table-b`. Record real date, device, lighting, background, piece and assigned split in `session-log.csv`. Names and dates in this example are placeholders.

## Keep sessions separate

Assign whole capture sessions to train, validation or test **before** selecting images. Aim initially for about 60/20/20 percent of sessions, with every animal represented in each split; adjust for the actual number of sessions. Never put adjacent video frames or nearly identical photos into different splits. Reserve new devices, tables and a later photo session for the final test.

Import only training photos into a Teachable Machine Standard Image Project. Use validation sessions to inspect confusion and calibrate the threshold, runner-up margin and consecutive-frame count. Keep final test sessions untouched until those choices are fixed. If you train again on test photos, collect a new independent test session.

## Validate before calling it recognition-ready

Record the true piece ID, predicted winner, full scores, accept/reject result and session ID. Produce an eight-animal-plus-other confusion table, report accepted wrong-animal results separately from rejects, and inspect performance for each animal and each phone/lighting condition. Agree an acceptable error target based on these results; no accuracy claim is made by the current prototype.

Default website filters are 0.85 model score, 0.15 winner margin and four matching frames. These are starting values, not calibrated probabilities or a guarantee. Test the visible centre crop on real phones. A score threshold cannot reliably solve all unknown-object or multi-piece cases.

Export TensorFlow.js `model.json`, `metadata.json` and the single `.bin` weights file. Connect them through Scan setup, then repeat the phone checklist in Product scan mode. Version the model alongside its session split and measured results. Raw photos are ignored by Git; placeholders and this plan are tracked.
