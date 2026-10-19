// Shared scan-result markup keeps the website and prototype on one content pipeline.
const mount = document.getElementById('profile-mount');
if (mount) {
  const template = document.createElement('template');
  template.innerHTML = `      <article class="profile-card" id="profile-card" aria-label="Scanned animal story" hidden>
        <div class="profile-top"><p class="eyebrow" id="story-label">THE STORY BEHIND THE PIECE</p><span class="draft-tag lab-only" id="review-status">SOURCED STORIES</span></div>

        <button class="text-button rescan-button" id="scan-another">← Scan another piece</button>
        <div id="profile-content" hidden>
          <div class="animal-heading"><div><p class="pin-id" id="pin-id"></p><h2 id="animal-name" tabindex="-1"></h2><p class="scientific" id="scientific-name"></p></div><div id="profile-illustration" class="piece-art"></div></div>
          <p class="mapping-note" id="mapping-note" hidden></p>
          <p id="animal-intro" class="animal-intro"></p><p class="result-origin lab-only" id="result-origin"></p>
          <div class="facts"><div><span id="status-label">CONSERVATION STATUS & SCOPE</span><p id="conservation-status"></p><p class="secondary-status" id="secondary-status"></p><p class="status-note" id="conservation-note"></p></div><div><span id="habitat-label">HABITAT</span><p id="habitat"></p></div><div><span id="threats-label">MAIN THREATS</span><p id="threats"></p></div><div><span id="protection-label">WHAT HELPS</span><p id="protection"></p></div><div><span id="fact-label">A CLOSER LOOK</span><p id="animal-fact"></p></div></div>
          <p class="art-credit"><span id="art-credit-text">Game artwork: llab design ltd, from the supplied campaign screenshots.</span> <a href="https://www.kickstarter.com/projects/llabdesign/jungle-king" target="_blank" rel="noopener">About Jungle King ↗</a></p>
          <details class="profile-sources"><summary id="sources-label">Sources & research dates</summary><ul id="source-list"></ul><p class="source" id="source"></p></details>
          <div class="animation-panel" id="animation-panel"><div><span class="field-label" id="movement-label">A LITTLE MOVEMENT</span><p id="animation-description">Artwork motion preview · not a 3D product model</p></div><button class="button secondary" id="animate">Play animation <span aria-hidden="true">▷</span></button></div>
          <div id="model-panel" hidden><p class="mapping-note" id="model-placeholder-note" hidden></p><model-viewer id="model-viewer" loading="eager" camera-orbit="35deg 70deg auto" camera-controls ar ar-modes="webxr scene-viewer quick-look" shadow-intensity="1" alt="Animal 3D model"><button slot="ar-button" class="button primary" id="ar-button">View in my space</button></model-viewer><p id="model-status" role="status"></p><p class="helper" id="ar-help">Drag to rotate; pinch or scroll to zoom. AR needs a supported phone. The AR app may display a static model even when animation works here.</p></div>
        </div>
      </article>
    <section hidden class="connections" aria-labelledby="connection-title"><div class="section-heading"><div><p class="eyebrow">BEHIND THE EXPERIENCE</p><h2 id="connection-title">One connected journey.</h2></div><span id="flow-origin">Waiting for a scan</span></div>
      <ol class="flow"><li id="flow-camera"><span class="step">01</span><strong>Input</strong><small id="input-state">Demo or camera</small></li><li id="flow-recognition"><span class="step">02</span><strong>Recognition</strong><small id="recognition-state">Demo ready · model optional</small></li><li id="flow-profile"><span class="step">03</span><strong>Animal profile</strong><small id="profile-state">Loading species.json…</small></li><li id="flow-animation"><span class="step">04</span><strong>Animation & AR</strong><small id="animation-state">Artwork ready · 3D optional</small></li></ol>
    </section>`;
  mount.replaceWith(template.content);
}
