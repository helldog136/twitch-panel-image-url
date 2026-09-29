(function () {
  "use strict";

  var form = document.getElementById("config-form");
  var imageUrlInput = document.getElementById("imageUrl");
  var linkUrlInput = document.getElementById("linkUrl");
  var preview = document.getElementById("preview");
  var status = document.getElementById("status");

  function updatePreview() {
    var url = imageUrlInput.value.trim();
    if (url) {
      preview.src = url;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  }

  imageUrlInput.addEventListener("input", updatePreview);

  // Hors contexte Twitch (test local sans Rig), window.Twitch reste
  // indéfini : on n'appelle onAuthorized/set que s'il existe, pour ne pas
  // planter l'aperçu visuel local.
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
          // Config existante illisible : on repart d'un formulaire vide
          // plutôt que de planter l'écran de configuration.
        }
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var imageUrl = imageUrlInput.value.trim();
    var linkUrl = linkUrlInput.value.trim();

    if (!imageUrl) {
      status.textContent = "L'URL de l'image est obligatoire.";
      return;
    }

    if (!window.Twitch || !window.Twitch.ext) {
      status.textContent = "SDK Twitch indisponible (test hors contexte Twitch).";
      return;
    }

    var content = JSON.stringify({ imageUrl: imageUrl, linkUrl: linkUrl });
    window.Twitch.ext.configuration.set("broadcaster", "1", content);
    status.textContent = "Enregistré.";
  });
})();
