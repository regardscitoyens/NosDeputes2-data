# deputes-data

Extraction JSON des [données de l'opendata de l'assemblée nationale](https://data.assemblee-nationale.fr/acteurs/historique-des-deputes) puis nettoyage pour en générer des csv exploitables.

Trois CSV en sortie :
- liste des députés de la législature 16
- liste de tous les organes de l'assemblée
- liens entre les députés et les organes

## Récupérer les dernires données :

Lancer `python fetch.py` pour récupérer les dernières versions

## Carte d'identité d'un député

Lancer `python carte-visite.py "PRENOM NOM"` pour avoir la carte d'identité d'un député (état civil et appartenance aux différents organes de l'assemblée)