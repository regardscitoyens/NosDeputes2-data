# Données des députés

Le repo propose deux approches pour récupérer les données sur les députés :

- Via Wikidata (dossier `/opendata/`)
- Via l'open data de l'assemblée (dossier `/wikidata/`)

Les deux approches offrent des avantages :

- Wikidata permet de récupérer des informations relatives aux réseaux sociaux (twitter notamment) ou encore à des images wikidata (si elles existent)
- l'open data de l'assemblée permet de récupérer de manière plus fine les différents organes d'appartenance de chaque député.

# "Releve DB CLI"

Le repo contient aussi (dans `/releve_db_cli/`) un gros script Typescript alimenter une nouvelle DB postgres à partir des données des tricoteuses et de certaines données de NosDeputes
