# Script pour construire une nouvelle DB postgres "Releve", pour le nouveau nosdeputes.fr, à partir des données des Tricoteuses + de certaines données du NosDeputes legacy

## Prequis

Il faut yarn et node. Voir package.json pour les versions exactes.

Il faut aussi Postgres

## Usage

Créer une DB postgres

Créer le fichier .env.local en se basant sur .env.local.sample

`yarn` pour installer les dépendances

Puis `yarn start --help` pour voir comment utiliser le script. Tout y est expliqué

## Sources de données utilisées

- Open data de l'AN (via Tricoteuses)
  - divers datasets : acteurs, organes, agendas, dossiers, etc.
- Open data de l'AN (en direct)
  - les compte rendus (mais ils ne sont pas vraiment utilisés pour l'instant, c'était un essai)
- Regards Citoyens (via le repo "auto_archive_deputes_data")
  - slugs de NosDeputes.fr
  - les stats hebdomadaire de chaque député
