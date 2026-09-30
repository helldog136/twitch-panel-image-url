# Dynamic Image from URL

A generic Twitch **Panel** extension: instead of uploading a fixed image to
a panel, it displays an image fetched from a URL you choose, refreshed
automatically — useful for anything that changes regularly (a schedule,
stats, a daily announcement...) without ever having to re-upload an image.
Clicking the image opens a configurable URL too.

The configuration (image URL + click-through URL) is stored by Twitch
itself via its [Configuration
Service](https://dev.twitch.tv/docs/extensions/building/#configuration-service),
read directly from the panel — no per-viewer data, no database of our own.

## Configuring it on your channel

Once the extension is installed and activated on your channel, click
"Configure" from the Twitch dashboard (Extensions), then fill in:

- **Image URL**: must be publicly reachable, no authentication required, HTTPS.
- **Click-through URL** (optional): where a viewer is sent when they click the image.

## Why there's a small proxy after all

Twitch extensions must declare a **fixed** list of allowed image domains in
the Developer Console (Capabilities tab, `img-src` CSP directive) — there is
no wildcard for "any domain" ([confirmed on the Twitch developer
forums](https://discuss.dev.twitch.com/t/wildcards-as-subdomains-in-allowlists/40099),
only same-parent subdomain wildcards like `https://*.example.com` work).
That's at odds with letting broadcasters point to *any* image URL of their
choosing.

The fix: `js/panel.js` and `js/config.js` never load the broadcaster's image
URL directly — they always request it through
`https://helldog136.be/api/image-proxy?url=<encoded image URL>`, so the
*only* domain that ever needs whitelisting in the Twitch console is
`https://helldog136.be` (set as both the "Domaines d'images" and "Liste
blanche des URL pour le panneau" values). The proxy (in the
[Website-Helldog136](https://github.com/helldog136/Website-Helldog136)
repo, `src/app/api/image-proxy/route.ts`) fetches the real URL server-side
and re-serves it.

Since that endpoint accepts an arbitrary URL from anyone, it's guarded
against SSRF: only `http(s)` is followed, every redirect hop is re-validated
against private/loopback/link-local ranges (`src/lib/safeFetch.ts`), the
upstream response must actually be `image/*`, the body is size-capped, and
requests are rate-limited per IP.

**Consequence for forks**: this ties every install of this extension to
`helldog136.be`'s uptime and bandwidth. Anyone forking this repo for their
own channel should register their own extension in their own Twitch
Developer Console and point `IMAGE_PROXY` in `js/panel.js`/`js/config.js` at
their own proxy (or any endpoint they trust with the same guarantees)
instead of reusing this one.

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
2. In the **Capabilities** tab, set "Choisissez comment configurer votre
   extension" to "Service de configuration de l'extension", and set both
   "Domaines d'images mis sur liste blanche" and "Liste blanche des URL
   pour le panneau" to the proxy's origin (`https://helldog136.be` if reusing
   this one, or your own — see "Why there's a small proxy after all" above).
   **This locks permanently once the version is sent to Hosted Test or
   review** — get it right on a fresh version rather than trying to edit it
   later.
3. Create a project in the Developer Rig with that Client ID, point the
   "Config URL" and "Panel URL" at this folder served locally (e.g.
   `npx serve .`).
4. Test the configuration form, then check the panel reflects the saved
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
