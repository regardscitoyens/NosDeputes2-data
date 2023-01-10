# Script pour construire une nouvelle DB postgres "Releve", pour le nouveau nosdeputes.fr, à partir des données des Tricoteuses + de certaines donnés du NosDeputes legacy

## Usage

Créer une DB postgres

Créer le fichier .env.local en se basant sur .env.local.sample

`yarn` pour installer les dépendances

Puis `yarn start --help` pour voir comment utiliser le script. Tout y est expliqué

# Infos sur les datasets utilisés so far

- Open data (via Tricoteuses)
  - dataset AM030
    - => est inséré dans les tables acteurs, organes, mandats
    - notes :
      - les mandats sont extraits des acteurs et mis dans une table à part
      - les adresses des acteurs sont retravaillées et mis dans un autre champ, avec une structure différente
  - datasets Agenda_XIV / XV / XVI
    - => sont insérés dans la table reunion
    - notes :
      - les doublons à travers ces datasets sont dédoublonnés, on garde la version la plus complète
- Regards Citoyens
  - slugs de NosDeputes.com (et les législatures précédentes)
    - => sont stockés dans la table nosdeputes_deputes
