(function () {
  "use strict";

  var REFRESH_MS = 5 * 60 * 1000; // 5 min — assez pour ne pas spammer l'hébergeur de l'image, assez court pour rester "automatique"

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
    // Cache-busting : l'image source change de contenu sans changer d'URL
    // (ex. le planning de la semaine), un navigateur pourrait autrement
    // garder l'ancienne version en cache plus longtemps que voulu.
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
    // Secours : si l'autorisation Twitch ne survient jamais (test local
    // hors Rig, ou script chargé sans être réellement dans l'iframe
    // Twitch), on affiche quand même l'état "non configuré" plutôt qu'une
    // page vide indéfiniment. Sans effet visible en conditions réelles,
    // où onAuthorized arrive en général en moins d'une seconde.
    setTimeout(function () {
      if (!authorized) applyConfig();
    }, 3000);
  } else {
    // Hors contexte Twitch (test local sans le SDK) : état vide, pas de crash.
    applyConfig();
  }
})();
