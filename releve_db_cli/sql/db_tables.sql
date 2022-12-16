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
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL,
    -- legislature du dataset, i.e. 15 pour les réunions trouvées dans le dataset Agenda_XV
    -- Attention il y avait des réunions qui étaient présentes à la fois dans le dataset 14 et 15.
    -- On a choisi de garder celles du 15, qui était un strict superset. Mais cela veut dire que la notion
    -- de legislature est un peu floue pour cette table
    -- Peut-être qu'il faudra se baser plutôt sur les dates
    legislature INT NOT NULL,
    -- le chemin qu'avait le fichier dans le dataset (sans le nom du fichier), par exemple SN/R5/L15/S2022/IDS/000/025
    -- je pense que ce n'est pas utile, que toutes les infos sont sans doute trouvables dans le json lui-même
    -- je garde quand même l'info pour le moment, pour vérifier
    path_in_dataset TEXT NOT NULL
);

DROP TABLE IF EXISTS nosdeputes_deputes;
CREATE TABLE nosdeputes_deputes (
    uid text PRIMARY KEY NOT NULL,
    slug text NOT NULL UNIQUE
);

