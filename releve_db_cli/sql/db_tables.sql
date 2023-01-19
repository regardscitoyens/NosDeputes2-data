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
    -- le chemin qu'avait le fichier dans le dataset (sans le nom du fichier), par exemple SN/R5/L15/S2022/IDS/000/025
    -- je pense que ce n'est pas utile, que toutes les infos sont sans doute trouvables dans le json lui-même
    -- je garde quand même l'info pour le moment, pour vérifier
    path_in_dataset TEXT NOT NULL
);

DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    uid text PRIMARY KEY NOT NULL,
    ordinaire BOOLEAN NOT NULL,
    legislature INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL
);

DROP TABLE IF EXISTS dossiers;
CREATE TABLE dossiers (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);

DROP TABLE IF EXISTS dossiers_simplified;
CREATE TABLE dossiers_simplified (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);

DROP TABLE IF EXISTS scrutins;
CREATE TABLE scrutins (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);

DROP TABLE IF EXISTS comptesrendus;
CREATE TABLE comptesrendus (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);

DROP TABLE IF EXISTS nosdeputes_deputes;
CREATE TABLE nosdeputes_deputes (
    uid text PRIMARY KEY NOT NULL,
    slug text NOT NULL UNIQUE
);

DROP TABLE IF EXISTS nosdeputes_deputes_weekly_stats;
CREATE TABLE nosdeputes_deputes_weekly_stats (
    uid text NOT NULL,
    legislature INTEGER NOT NULL,
    data jsonb NOT NULL,
    UNIQUE (uid, legislature)
);

