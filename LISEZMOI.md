# Retourne ta veste

Le jeu de cartes de la présidentielle 2027 (collection « À peu près d'accord ») : le jeu, l'appli Android, le site et le serveur en ligne, au même endroit.

Version actuelle : **0.51** (identifiant Android `fr.apeupresdaccord.retournetaveste`).

## Ce qu'il y a où

| Dossier | Rôle |
|---|---|
| `carte2/` | Le jeu (HTML, CSS, JavaScript, sans framework) : `index.html`, `jeu.js` (interface), `moteur.js` (règles et IA), `donnees.js` (cartes, actions, anecdotes, sources), `cartes.js` (dessin des cartes), `sons.js`, `decors.js`, `trophees.js`, `profil.js`, `tetes.js`, et `img/` (portraits, miniatures, décors) |
| `carte2/fiches.js`, `carte2/fiche.js` | Le verso factuel des cartes candidat (bouton « La fiche » de la collection) : `fiches.js` est l'**export public** des fiches, régénéré à partir de la version publique du site « Les fiches de la présidentielle 2027 » (script `site-fiches/construire.py`, pas encore dans ce dépôt) : ne pas le modifier à la main ; `fiche.js` affiche la fiche (onglets Parcours et Idées). Aucune donnée judiciaire n'y figure. Le lien vers la fiche complète utilise `window.APDA_FICHES` (dans `carte2/index.html`) ; `window.APDA_SITE` reste l'adresse du jeu, pour les invitations en ligne. |
| `apk/` | Fabrication de l'appli Android : `projet/` (manifeste, ressources), `smali/` (code de l'activité), `outils/`, `outil-src/`, `assembler.py`, `faire_aab.py`, `icones/` |
| `enligne/` | Serveur des parties en ligne (Node.js, pas encore ouvert) et `preparer_site.py`, qui fabrique le site autonome |
| `play/` | Fiche Google Play : icône, bannière, captures, description, page de confidentialité |
| `scripts/` | Traitement des portraits, calcul des valeurs des cartes |
| `tests/` | Tests du moteur, simulations d'équilibre, tests navigateur (`navigateur/`) |
| `polices/` | Polices embarquées dans l'appli et le site |
| `portraits_src/` | Portraits d'origine en PNG |
| `registre/`, `valeurs/`, `data_mv/`, `data_mv2/` | Registre des cartes et données de calcul |

## Ce qui n'est pas dans le dépôt

- **Les clés de signature** (`apk/cle/`) : à garder à part, en lieu sûr. Sans `envoi.p12`, il faut demander à Google une nouvelle clé d'envoi.
- Les données des joueurs du serveur (`enligne/donnees/`).
- Tout ce que les scripts refabriquent : APK, AAB, site autonome, captures des tests.

## Fabriquer

Les scripts utilisent des chemins en `/home/claude/…` : place le dépôt à cet endroit, ou adapte les chemins en tête des scripts.

1. Site autonome : `python3 enligne/preparer_site.py apk/assets`
2. APK : dans `apk/`, `java -cp outils/ARSCLib.jar:outil-src Outil build projet base.apk`, puis `python3 assembler.py retourne-ta-veste-X.apk` (le fichier arrive dans `apk/sortie/`)
3. Bundle Play Store : `python3 faire_aab.py <apk> <aab>`

Avant chaque version, augmente `versionCode` et `versionName` dans `apk/projet/AndroidManifest.xml`.
