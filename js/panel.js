(function () {
  "use strict";

  var REFRESH_MS = 5 * 60 * 1000; // 5 min — long enough not to hammer the image host, short enough to still feel "live"

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
    // Cache-busting: the source image's content can change without its URL
    // changing (e.g. a weekly schedule image) — without this, a browser
    // could keep showing a stale cached copy longer than intended.
    var separator = config.imageUrl.indexOf("?") === -1 ? "?" : "&";
    img.src = config.imageUrl + separator + "t=" + Date.now();
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
