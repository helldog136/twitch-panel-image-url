(function () {
  "use strict";

  var form = document.getElementById("config-form");
  var imageUrlInput = document.getElementById("imageUrl");
  var linkUrlInput = document.getElementById("linkUrl");
  var preview = document.getElementById("preview");
  var status = document.getElementById("status");

  // Same proxy as js/panel.js — the config screen's live preview is also
  // subject to Twitch's fixed image-domain whitelist, so it must load
  // through it too. See the comment in panel.js for the full rationale.
  var IMAGE_PROXY = "https://helldog136.be/api/image-proxy";

  function updatePreview() {
    var url = imageUrlInput.value.trim();
    if (url) {
      preview.src = IMAGE_PROXY + "?url=" + encodeURIComponent(url);
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  }

  imageUrlInput.addEventListener("input", updatePreview);

  // Outside a Twitch context (local test without the Rig), window.Twitch
  // stays undefined: only call onAuthorized/set when it exists, so the
  // local visual preview never crashes.
  if (window.Twitch && window.Twitch.ext) {
    window.Twitch.ext.onAuthorized(function () {
      var existing = window.Twitch.ext.configuration.broadcaster;
      if (existing && existing.content) {
        try {
          var data = JSON.parse(existing.content);
          imageUrlInput.value = data.imageUrl || "";
          linkUrlInput.value = data.linkUrl || "";
          updatePreview();
        } catch (e) {
          // Existing config unreadable: start from a blank form instead of
          // crashing the configuration screen.
        }
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var imageUrl = imageUrlInput.value.trim();
    var linkUrl = linkUrlInput.value.trim();

    if (!imageUrl) {
      status.textContent = "Image URL is required.";
      return;
    }

    if (!window.Twitch || !window.Twitch.ext) {
      status.textContent = "Twitch SDK unavailable (testing outside a Twitch context).";
      return;
    }

    var content = JSON.stringify({ imageUrl: imageUrl, linkUrl: linkUrl });
    window.Twitch.ext.configuration.set("broadcaster", "1", content);
    status.textContent = "Saved.";
  });
})();
