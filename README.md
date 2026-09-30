# Dynamic Image from URL

A generic Twitch **Panel** extension: instead of uploading a fixed image to
a panel, it displays an image fetched from a URL you choose, refreshed
automatically — useful for anything that changes regularly (a schedule,
stats, a daily announcement...) without ever having to re-upload an image.
Clicking the image opens a configurable URL too.

No backend: the configuration (image URL + click-through URL) is stored by
Twitch itself via its [Configuration
Service](https://dev.twitch.tv/docs/extensions/building/#configuration-service),
read directly from the panel — no per-viewer data, no server of our own.

## Configuring it on your channel

Once the extension is installed and activated on your channel, click
"Configure" from the Twitch dashboard (Extensions), then fill in:

- **Image URL**: must be publicly reachable, no authentication required, HTTPS.
- **Click-through URL** (optional): where a viewer is sent when they click the image.

## Developing / testing

Static files, no build step:

- `config.html` / `js/config.js` — configuration screen (broadcaster).
- `panel.html` / `js/panel.js` — panel shown to viewers.
- `css/style.css` — shared styles.

The Twitch SDK (`window.Twitch.ext`) only exists in a real Twitch context
(a live channel) or simulated by the [Developer
Rig](https://dev.twitch.tv/docs/extensions/rig/) — opening the HTML files
directly in a plain browser lets you check the layout (both scripts detect
a missing `window.Twitch` and skip calling the SDK) but not the real
configuration round-trip.

### With the Developer Rig

1. [Create the extension](https://dev.twitch.tv/console/extensions/create)
   in the Twitch Developer Console (type **Panel**).
2. Create a project in the Developer Rig with that Client ID, point the
   "Config URL" and "Panel URL" at this folder served locally (e.g.
   `npx serve .`).
3. Test the configuration form, then check the panel reflects the saved
   image + link, including after a change (`configuration.onChanged`).

### Publishing

1. Package the release into a zip: `python package.py <version>` (e.g.
   `python package.py 0.0.1`) — writes `twitch-extension-<version>.zip`.
   **Don't** zip it by hand with PowerShell's `Compress-Archive`: on
   Windows it stores nested-folder entries with backslashes
   (`css\style.css`), which Twitch's asset hosting can't resolve against
   the forward-slash paths used in `<link>`/`<script>` — the CSS and JS
   silently fail to load with no visible error. `package.py` always writes
   forward-slash paths.
2. Upload the zip via the Developer Console (Files tab), create a version,
   activate it as Hosted Test then Live once verified.
3. Twitch hosts the files itself once uploaded — this repo has no
   automated deployment, only the manual publishing steps above.

## License

MIT — see [LICENSE](LICENSE).
