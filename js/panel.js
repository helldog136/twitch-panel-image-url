(function () {
  "use strict";

  var REFRESH_MS = 5 * 60 * 1000; // 5 min — long enough not to hammer the image host, short enough to still feel "live"

  // Twitch requires extensions to declare a FIXED list of allowed image
  // domains (no wildcard for "any domain" is supported — see
  // https://discuss.dev.twitch.com/t/wildcards-as-subdomains-in-allowlists/40099),
  // but this extension lets broadcasters point to ANY image URL. So the
  // panel always loads images through this one proxy (the only domain
  // whitelisted in the Twitch Developer Console), which fetches the real
  // URL server-side and re-serves it — see the Website-Helldog136 repo,
  // src/app/api/image-proxy/route.ts, for the SSRF-guarded implementation.
  var IMAGE_PROXY = "https://helldog136.be/api/image-proxy";

  var link = document.getElementById("panel-link");
  var img = document.getElementById("panel-image");
  var emptyState = document.getElementById("empty-state");

  var config = null;
  var refreshTimer = null;

  function applyConfig() {
    if (!config || !config.imageUrl) {
      img.style.display = "none";
      link.style.display = "none";
      emptyState.style.display = "flex";
      return;
    }
    emptyState.style.display = "none";
    link.href = config.linkUrl || config.imageUrl;
    link.style.display = "block";
    img.style.display = "block";
    refreshImage();
  }

  function refreshImage() {
    if (!config || !config.imageUrl) return;
    // Cache-busting via "t": the source image's content can change without
    // its URL changing (e.g. a weekly schedule image) — without this, a
    // browser (or the proxy's own upstream fetch) could keep showing a
    // stale cached copy longer than intended.
    img.src =
      IMAGE_PROXY + "?url=" + encodeURIComponent(config.imageUrl) + "&t=" + Date.now();
  }

  function readConfig() {
    if (!window.Twitch || !window.Twitch.ext) return;
    var segment = window.Twitch.ext.configuration.broadcaster;
    if (!segment || !segment.content) {
      config = null;
      applyConfig();
      return;
    }
    try {
      config = JSON.parse(segment.content);
    } catch (e) {
      config = null;
    }
    applyConfig();
  }

  if (window.Twitch && window.Twitch.ext) {
    var authorized = false;
    window.Twitch.ext.onAuthorized(function () {
      authorized = true;
      readConfig();
      if (!refreshTimer) {
        refreshTimer = setInterval(refreshImage, REFRESH_MS);
      }
    });
    window.Twitch.ext.configuration.onChanged(readConfig);
    // Fallback: if Twitch authorization never fires (local test without
    // the Rig, or the script loaded outside a real Twitch iframe), show
    // the "not configured" state instead of a blank page forever. No
    // visible effect in real conditions, where onAuthorized usually fires
    // in under a second.
    setTimeout(function () {
      if (!authorized) applyConfig();
    }, 3000);
  } else {
    // Outside a Twitch context (local test without the SDK): empty state, no crash.
    applyConfig();
  }
})();
