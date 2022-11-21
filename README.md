# Données des députés

Le repo propose deux approches pour récupérer les données sur les députés :

- Via Wikidata (dossier `/opendata/`)
- Via l'open data de l'assemblée (dossier `/wikidata/`)

Les deux approches offrent des avantages :

- Wikidata permet de récupérer des informations relatives aux réseaux sociaux (twitter notamment) ou encore à des images wikidata (si elles existent)
- l'open data de l'assemblée permet de récupérer de manière plus fine les différents organes d'appartenance de chaque député.

# Données des Tricoteuses

Le repo contient aussi (dans `/tricoteuses_to_nosdeputes_script/`) un gros script Typescript pour aller chercher les données des Tricoteuses et les mettre dans une nouvelle base de données Postgres
