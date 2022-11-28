# Notes suite à call du 29/11/2022 avec @RouxRC

## Grandes lignes

Benjamin veut continuer à bosser sur les données, il en a besoin de certaines de toutes façon pour son taf

L'open data de l'assemblée est bien, il semble d'accord pour dire que c'est une bonne base de travail

MAIS il y a aussi des moulinettes chez NosDeputes qui sont complexes, bien huilées depuis des années et qu'on ne pourra réalistiquement pas recoder from scratch, ou pas aussi bien. J'ai noté surtout :

- le recueil des comptes Twitter
- le parsing des comptes rendus de commissions
- le parsing des comptes rendus de séance

De plus, ces données (les comptes rendus de séances/commissions) sont indispensables pour NosDeputes : ils permettent d'avoir les présences et les intervention, nécessaires pour faire les graphes d'activité.

## Recueil des comptes Twitter

NosDeputes a un repo dédié

Une moulinette tourne tous les jours, grosso modo :

- elle part des données existantes en base (qui viennent historiquement des legislatures précédentes)
- elle va chercher sur des listes de comptes twitter qui sont maintenus par certaines personnes (il m'a parlé de LCP AN)
- il y a une mécanique pour tester que les comptes twitter existent toujours, (avec un warning et potentielle suppression si pas de tweet depuis un an), suivre les renommages de comptes twitter, etc
- en fallback ça fait une recherche sur l'API de twitter avec le nom/prénom, les résultats sont proposés à Benjamin, qui valide manuellement

Benjamin pense vraiment qu'il a la meilleure base des comptes twitter des députés

# Comptes rendus + relevés de présence des commission

=> pas dans l'open data, il faut faire du scraping.

- les comptes rendus (pour avoir les interventions)
- les relevés de présence (pour avoir les présences). Vient de deux sources :

  - il est parfois en bas du compte rendu
    (attention les comptes rendus peuvent être publiés très en retard, jusqu'à quelque mois)
  - sinon il est dans le Journal Officiel
    (publication beaucoup plus rapide)
    peut-être pour certains petites commissions y a pas de publication au JO ?

Benjamin gère régulièrement des problèmes sur ce parsing, tous les weekends.

C'est du code assez récent, python 3 et c'est un métier très compliqué, Benjamin propose de le garder.

# Comptes rendu des séances en hemicycle

- publié dans l'open data en xml
- mais attention c'est du "word converti en xml" donc c'est pas toujours terrible
- beaucoup de travail pour traiter les interventions, interruptions, interruptions doubles, retrouver les ids de députés car parfois il y a juste ("Mme machin")
- dans l'open data il y a parfois une id de la loi qui est discutée, mais pas toujours, c'est compliqué pour faire le lien

Là aussi Benjamin gère régulièrement des problèmes sur ce parsing, tous les weekends (plus stable que les commissions, presque automatisable maintenant).

C'est du code assez récent, python 3 et c'est un métier très compliqué, Benjamin propose de le garder.

## MAJs de l'Open Data par rapport au site de l'AN

Warning sur les maj de l'open data, parfois ils sont moins à jour que le site de l'assemblee. Parfois l'open data peut-être en avance. Ou les données peuvent être différentes.

En gros on pourrait penser que le site ne fait qu'afficher la même source de données que l'open data, mais visiblement non.

## Scrutins

NosDeputes parse l'open data, cela ne devrait pas poser problème.

Sur les scrutins les infos entre le site et l'open data ne sont pas les mêmes, on ne sait pas lequel est à jour ou pas, lequel a raison ou pas.

### Lien scrutin -> intervention

Dans l'open data le scrutin est lié a une séance, mais pas à l'intervention précise (la ligne dans le compte rendu qui dit que le scrutin a eu lieu).

ça dans NosDeputes ils le font, ils retrouvent l'intervention correspondante, en cherchant approximativement dans le texte.

### Votes

Si le vote était par délégation -> ils ne le comptent pas comme une présence

Attention le président de l'AN est toujours indiqué non-votant (qu'il soit présent ou pas) donc il ne faut pas le compter comme une preuve de présence

## Open data du Sénat

Le sénat a aussi son propre open data (des dumps Postgres). Ils les ont utilisés pour la Fabrique de la Loi.

Les dossiers legislatifs de l'open data du Senat sont peut-être mieux que les dossiers legislatifs de l'AN. Mais pas avec les mêmes ids...

Benjamin ne conseille pas de creuser de ce côté, ce ne sera pas utile pour NosDeputes.

## Dossiers legislatifs

Effectivement les dossiers législatifs c'est apparenté aux Dossiers de NosDeputes (table "section"), mais comme chez NosDeputes c'est historiquement basé sur le parsing du sommaire des séances, c'est mélangé avec plein d'autres petits trucs qui ne sont pas des dossiers législatifs, genre "allocution de la présidente", etc.

## Agendas (Réunions)

Benjamin dit que ce dataset n'est pas très utile, car on a la date des réunions mais pas grand chose d'autres.

Il faudrait la liste des participants. Benjamin pense se souvenir que le champ est présent mais quasiment jamais remplis

## Questions écrites

Il y a une url cachée (non publiée) pour avoir les données "open data" des questions écrites que Benjamin utilise.

Mais il faut voir quand même les données des tricoteuses, elles sont peut-être mieux.

## Questions orales

A voir si c'est correct dans l'open data

Car techniquement c'est juste une intervention dans la séance des Questions aux gouvernement (en excluant les petits interjections).

Peut-être que dans l'open data ils ont modélisé les questions orales de manières vraiment séparée ?

## Les stats d'activité des députés

C'est des décomptes recalculés tous les jours (sur les 12 derniers mois) et stockés dans le député
