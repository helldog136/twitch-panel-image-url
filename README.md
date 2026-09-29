# Panel : image + lien depuis une URL

Extension Twitch (type **Panel**) générique : au lieu d'uploader une image
fixe dans un panneau, elle affiche une image récupérée depuis une URL que tu
choisis, rafraîchie automatiquement — utile pour tout ce qui change
régulièrement (planning, stats, annonce du jour…) sans avoir à retélécharger
une image à chaque fois. Un clic sur l'image ouvre une URL elle aussi
configurable.

Pas de backend : la configuration (URL image + URL de clic) est stockée par
Twitch lui-même via son [Configuration
Service](https://dev.twitch.tv/docs/extensions/building/#configuration-service),
lue directement depuis le panneau — aucune donnée par-spectateur, aucun
serveur à nous.

## Configurer sur sa chaîne

Une fois l'extension installée et activée sur ta chaîne, clique
« Configurer » depuis le tableau de bord Twitch (Extensions), puis
renseigne :

- **URL de l'image** : doit être accessible publiquement, sans
  authentification, en HTTPS.
- **URL de clic** (optionnel) : où envoyer le spectateur qui clique sur
  l'image.

## Développer / tester

Fichiers statiques, pas de build :

- `config.html` / `js/config.js` — écran de configuration (broadcaster).
- `panel.html` / `js/panel.js` — panneau vu par les spectateurs.
- `css/style.css` — styles partagés.

Le SDK Twitch (`window.Twitch.ext`) n'existe que dans un vrai contexte
Twitch (chaîne réelle) ou simulé par le [Developer
Rig](https://dev.twitch.tv/docs/extensions/rig/) — ouvrir les fichiers HTML
directement dans un navigateur classique permet de vérifier la mise en page
(les deux scripts détectent l'absence de `window.Twitch` et n'appellent pas
le SDK) mais pas le round-trip de configuration réel.

### Avec le Developer Rig

1. [Créer l'extension](https://dev.twitch.tv/console/extensions/create)
   dans la Developer Console Twitch (type **Panel**).
2. Créer un projet dans le Developer Rig avec ce Client ID, pointer la
   « Config URL » et la « Panel URL » vers ce dossier servi en local (ex.
   `npx serve .`).
3. Tester le formulaire de configuration puis vérifier que le panneau
   reflète bien l'image + le lien enregistrés, y compris après un
   changement (`configuration.onChanged`).

### Publier

1. Zipper le contenu du dépôt (`config.html`, `panel.html`, `css/`, `js/` —
   pas `.git`, `README.md`/`LICENSE` ne sont pas nécessaires non plus).
2. Uploader le zip via la Developer Console (Asset Hosting), créer une
   version, l'activer en Hosted Test puis en Live une fois vérifiée.
3. Twitch héberge lui-même les fichiers une fois uploadés — ce dépôt n'a pas
   de déploiement automatisé, seulement la publication manuelle décrite
   ci-dessus.

## Licence

MIT — voir [LICENSE](LICENSE).
