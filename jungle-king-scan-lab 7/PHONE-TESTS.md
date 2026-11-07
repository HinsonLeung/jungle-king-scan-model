# Phone acceptance checklist

Prepared 14 October 2026. Physical-device results: **not run**. Desktop tests with generated camera-stream frames do not replace these checks.

Upload `dist/` to an HTTPS preview and open it in Safari on an iPhone and Chrome on an Android phone. A phone cannot reach this computer's `localhost`; plain HTTP over a LAN also lacks the required secure camera context. Record the exact preview URL, phone model, OS and browser version for each run.

1. Open the main website first. Check the white scanner layout and top-right **EN / 繁中** switch in portrait/landscape. The copy and camera messages should translate; refresh should remember the language. With no model configured, camera preview should work and the preparation note should remain visible. Follow **Prototype** in the footer. Open `qr-cards.html` on a second screen, or print it at normal size with the white margins intact. Keep **QR test cards** selected on the phone's prototype page, enable the camera and start QR scanning.
2. Allow permission. Check that the rear camera is selected and the video fills the frame. Scan each of the eight cards, one at a time. Only its matching profile should appear, with **QR TEST CARD** as the result origin. Aquatic Rat must retain its provisional identity warning.
3. Tap **Scan another piece** and start again. Repeat the same card, then switch to a different one. Present an unrelated QR code and an empty scene: no animal card should appear.
4. Pause QR scanning, stop the camera, and return after putting the browser in the background. Scanning should pause in the background; leaving the page should stop the stream. Permission requests and camera recovery should remain understandable.
5. Deny camera permission, reload, then allow it through browser/site settings. No card should appear on denial. In an embedded browser, open the HTTPS page in the full browser if camera access is blocked.
6. Test portrait and landscape, small screens, scrolling, and English / 繁體中文. Changing language should preserve the selected animal and ongoing 3D playback. Refresh should retain the card-language choice and start with the profile hidden.
7. Scan the tiger. Wait for the test model to load; drag to rotate, pinch to zoom, play and pause its head/tail animation. Confirm that the placeholder and approximate 13 cm test scale are visible.
8. Tap **View in my space** if the device offers AR. Place it on a table and check orientation and size. Record Android Scene Viewer/WebXR and iPhone Quick Look separately. Record animation as a separate result: a static AR model may be expected even though the website animates the GLB. If AR is unsupported, the on-page 3D viewer should still work.
9. Repeat with slower connectivity and a failed asset/library request. A failure must leave a clear error and a usable scanner; it must not reveal a different animal.

| Device / OS / browser | Camera & eight cards | Repeat / stop / denial | Portrait / landscape / languages | 3D rotation & animation | AR placement | AR animation |
| --- | --- | --- | --- | --- | --- | --- |
| iPhone / pending | Not run | Not run | Not run | Not run | Not run | Not run |
| Android / pending | Not run | Not run | Not run | Not run | Not run | Not run |

Report failures with the card ID, steps, visible message and device details. Product appearance recognition remains out of scope until real pieces and a trained model are available.
