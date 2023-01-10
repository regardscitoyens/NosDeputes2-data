# Script pour fetcher les dumps MySQL de nosdeputes.fr (toutes les législatures) et les stocker sous former fichiers plats dans un repo .git

TODO

- fetcher les dumps (dézipper ?)
- importer les dumps dans un MySQL
- voir si on peut renommer/préfixer les tables avant d'importer le dump, pour mettre tous les dumps dans la même DB ?
  - note : pas forcément nécessaire car pour les anciennes DBs, les dumps ne devraient plus être mis à jour
- voir comment on peut les dumper, sous quel format de fichier plat
- ensuite, mettre les fichiers plat dans un repo git et faire des commits
- note : il faudra aussi archiver les dumps (les commiter dans .git au cas où)

<!--

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


-->
