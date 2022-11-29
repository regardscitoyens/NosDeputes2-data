## Dossiers législatifs

Dossiers_Legislatifs_XVI_nettoye

https://git.en-root.org/tricoteuses/data/assemblee-nettoye/Dossiers_Legislatifs_XVI_nettoye

à creuser

Doc associée https://data.tricoteuses.fr/doc/assemblee/dossier.html

est-ce la même chose qu'une "section" dans nosdeputes ?

Contenu dans la db postgres par xsiType (il n'y a que la legislature 16):

    DossierIniativeExecutif_Type	6
    DossierLegislatif_Type	359
    DossierMissionControle_Type	15
    DossierResolutionAN	55

Très compliqué à comprendre, il faut lire la doc à fond

### Fields intéressants

- data ->> 'xsiType'

  - DossierLegislatif_Type
    - principalement des projets/propositions de lois. Quelques autres trucs.
  - OU DossierResolutionAN
    - principalements des propositions de résolutions. Plus quelques allocutions de président de l'assemblée ou du doyen, qui sont rangées là sans doute un peu par erreur
  - OU DossierMissionControle_Type
    - Divers rapports d'information par tel ou tel groupe de député, pas lié à une procédure législative quelconque. Principalement des rapports d'application de la loi
  - OU DossierIniativeExecutif_Type
    - ce ne sont que les motions de censure suite aux 49.3

- data -> 'procedureParlementaire' ->> 'libelle'

- data -> 'titreDossier' ->> 'titre'

  - titre intelligible

- `CONCAT('http://www.assemblee-nationale.fr/dyn/16/dossiers/', data -> 'titreDossier' ->> 'titreChemin') as url_assemblee`

  - permet d'avoir le lien sur le site de l'AN

- data -> 'actesLegislatifs'
  - structure hiérarchique des différentes étapes du cycle de vie législatif. A décomposer au cas par cas...

### query d'exemple

    select
    data,
    concat('http://www.assemblee-nationale.fr/dyn/16/dossiers/', data -> 'titreDossier' ->> 'titreChemin') as url_assemblee,
    data ->> 'xsiType',
    data -> 'procedureParlementaire' ->> 'libelle',
    data -> 'titreDossier' ->> 'titre'
    from dossiers
    where legislature = 16
    ;
