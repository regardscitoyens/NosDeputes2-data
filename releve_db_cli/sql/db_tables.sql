DROP TABLE IF EXISTS acteurs;
CREATE TABLE acteurs (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL,
    adresses jsonb NOT NULL
);

DROP TABLE IF EXISTS organes;
CREATE TABLE organes (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);

DROP TABLE IF EXISTS mandats;
CREATE TABLE mandats (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL,
    acteur_uid TEXT NOT NULL,
    organes_uids TEXT[] NOT NULL
);

-- dataset agenda : réunions de commissions, séance, réunions qconques entre parlementaires, etc.
DROP TABLE IF EXISTS reunions;
CREATE TABLE reunions (
    uid text NOT NULL,
    data jsonb NOT NULL,
    -- legislature du dataset, i.e. 15 pour les réunions trouvées dans le dataset Agenda_XV
    -- j'ai cru comprendre qu'il pouvait y avoir des réunions qui débordaient d'un dataset à l'autre en début/fin de législature, donc à vérifier si c'est fiable.
    legislature INT NOT NULL,
    -- le chemin qu'avait le fichier dans le dataset (sans le nom du fichier), par exemple SN/R5/L15/S2022/IDS/000/025
    -- je pense que ce n'est pas utile, que toutes les infos sont sans doute trouvables dans le json lui-même
    -- je garde quand même l'info pour le moment, pour vérifier
    path_in_dataset TEXT NOT NULL,
    -- Une réunion semble donc être parfois dans plusieurs législature
    -- je fais comme ça pour le moment, mais on pourra surement dédoublonner la dernière version
    PRIMARY KEY (uid, legislature) 
);

DROP TABLE IF EXISTS nosdeputes_deputes;
CREATE TABLE nosdeputes_deputes (
    uid text PRIMARY KEY NOT NULL,
    slug text NOT NULL UNIQUE
);

