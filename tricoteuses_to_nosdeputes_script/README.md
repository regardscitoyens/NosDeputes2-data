# Script pour construire une DB postgres pour le nouveau nosdeputes.fr, à partir des données des tricoteuses

- Fait des `git clone` des datasets nettoyes des Tricoteuses, pour récupérer leur données
- Crée les tables correspondantes dans une DB postgresql
- Injecte les données dans ces tables

Un peu similaire à ce qui est fait dans https://git.en-root.org/tricoteuses/tricoteuses-api-assemblee, mais pas exactement pareil.

Ce n'est pas exactement la même structure de DB. Ici le but c'est de préparer exactement les données dont notre front aura besoin, du coup 1/ on n'intègrera peut-être pas certains datasets 2/ on pourra organiser les tables comme on veut 3/ on pourra ajouter des données qui ne viennent pas des tricoteuse (slugs nosdeputes, infos de wikidata, etc.)

## Usage

Créer une DB postgres

Créer le fichier .env.local en se basant sur .env.local.sample

`yarn` pour installer les dépendances

Puis `yarn start --help` pour voir comment utiliser le script
