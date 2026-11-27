# Baston sur les toits

Jeu de combat à plateformes, satirique, sur les toits de l'Élysée. Prototype, version 0.7. Personnages inventés.

| Dossier | Contenu |
|---|---|
| `jeu/index.html` | Le jeu entier dans une seule page : moteur, IA, commandes (clavier, tactile, manettes), planches et décor intégrés |
| `android/` | L'appli Android : `projet/` (manifeste, icônes), `smali/` (activité WebView en plein écran), `polices/`, `fabriquer.py` |
| `planches/` | Images d'origine : planches de 8 poses sur fond magenta, décor des toits |
| `outils/planche.py` | Détoure une planche et espace ses 8 poses, pour l'intégrer à `jeu/index.html` |
| `tests/simulation.py` | Combats IA contre IA : taux de victoire par candidat, combats bloqués |

## Fabriquer l'APK

    python3 baston/android/fabriquer.py 0.8

Augmenter d'abord `versionCode` et `versionName` dans `android/projet/AndroidManifest.xml`.

**Clé de signature** : elle n'est pas dans le dépôt (`baston/android/cle/` est ignoré). Sans les fichiers `cle.pem` et
`certificat.pem` d'origine dans ce dossier, une mise à jour ne s'installe pas par-dessus la version précédente.

## Vérifier l'équilibrage

    python3 baston/tests/simulation.py

Chaque candidat doit rester entre 45 % et 55 % de victoires, sans combat bloqué.
