# L'Hémicycle en ligne

Le site « À peu près d'accord » (les cartes et le jeu) avec ce qu'il faut pour jouer en ligne :

- **Défier un ami** : un lien à partager, la partie commence dès qu'il l'ouvre.
- **Partie rapide** : contre le premier joueur en attente, règles standard, trois minutes par coup. Elle compte au classement.
- **Classement** des victoires en partie rapide, avec pseudo et avatar choisis par chaque joueur.

Le serveur arbitre : il vérifie chaque coup avec le moteur du jeu, et la main adverse n'est jamais envoyée au navigateur.

## Contenu

| Fichier | Rôle |
|---|---|
| `serveur.js` | sert le site et arbitre les parties (Node.js 22 ou plus, testé sous 22 et 26 ; une seule dépendance : `ws`) |
| `admin.js` | modération du classement (lister, renommer, effacer un profil, interdire un mot) |
| `site/` | le site complet, polices comprises (aucune requête vers un service tiers) |
| `deploiement/` | le service systemd et la configuration de Caddy (HTTPS) |
| `test/` | bancs d'essai : `robots.js` (parties entre robots), `abus.js` (coups interdits), `classee.js` (parties rapides et classement) |

## Essayer sur ton ordinateur

```
npm install
node serveur.js
```

Puis ouvre http://127.0.0.1:8080 dans deux navigateurs différents (ou une fenêtre normale et une fenêtre privée).

## Installer sur un serveur

Le guide pas à pas (Amazon Lightsail, nom de domaine, Node.js, Caddy, service, sauvegardes, modération) est dans le document « Installer L'Hémicycle en ligne » : https://claude.ai/artifact/2MX4KcTp5i5MZsS5fZXLw2

En résumé, une fois Node.js 26 (dépôt NodeSource) et Caddy (dépôt officiel) installés, et ce dossier placé dans /opt :

```
cd /opt/hemicycle-en-ligne && npm ci --omit=dev
sudo useradd --system --no-create-home --shell /usr/sbin/nologin hemicycle
sudo install -d -o hemicycle -g hemicycle -m 750 /var/lib/hemicycle
sudo cp deploiement/hemicycle.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now hemicycle
sudo cp deploiement/Caddyfile /etc/caddy/Caddyfile   # puis remplace jeu.exemple.fr par ton domaine
sudo systemctl reload caddy
```

## Réglages (variables d'environnement)

| Variable | Par défaut | Rôle |
|---|---|---|
| `PORT` | 8080 | port d'écoute |
| `HOTE` | 127.0.0.1 | adresse d'écoute (en local derrière Caddy) |
| `DONNEES` | `./donnees` | dossier des profils (`joueurs.json`) et des mots interdits |
| `APDA_DON` | vide | lien de la page de dons |
| `ORIGINES` | vide | autres origines autorisées pour la connexion (par exemple l'appli Android) |

## Données gardées

Pour chaque joueur en ligne : son pseudo, son avatar, ses victoires, défaites et égalités en partie rapide, la date de création du profil et celle de sa dernière partie classée, et l'empreinte (pas le contenu) d'un secret gardé par son navigateur. Ni adresse e-mail, ni mot de passe, ni adresse IP enregistrée. Un joueur peut effacer son profil depuis le classement.
