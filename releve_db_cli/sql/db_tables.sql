DROP TABLE IF EXISTS acteurs;
CREATE TABLE acteurs (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);


DROP TABLE IF EXISTS organes;
CREATE TABLE organes (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL
);

DROP TABLE IF EXISTS mandat;
CREATE TABLE mandats (
    uid text PRIMARY KEY NOT NULL,
    data jsonb NOT NULL,
    acteur_uid TEXT NOT NULL,
    organes_uids TEXT[] NOT NULL
);



-- TODO mandats ?
