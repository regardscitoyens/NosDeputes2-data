import json
import glob
import pandas as pd
import requests
import zipfile

# Attention, les données présentes ici : https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice
# ne tiennent compte que des députés à l'instant T, pas de l'ensemble des députés de la législature
# Pour avoir l'historique, il faut utiliser le fichier historique (qui remonte jusqu'à la législature 11)
# Données disponibles ici : https://data.assemblee-nationale.fr/acteurs/historique-des-deputes
url = (
    "https://data.assemblee-nationale.fr/static/openData/repository/16/amo/" "tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_"
    "mandats_tous_organes_historique.json.zip"
)

r = requests.get(url)
open("deputes.zip", "wb").write(r.content)

with zipfile.ZipFile("deputes.zip", "r") as zip_ref:
    zip_ref.extractall("data")


def concatJsonIntoOne(path):
    files = glob.glob(path)
    allobjects = []
    for f in files:
        with open(f, "r") as fp:
            data = json.load(fp)
            allobjects.append(data)
    return allobjects


def ifExistObject(obj, propertyObj):
    try:
        return obj[propertyObj]
    except KeyError:
        return None

####
####
# On s'occupe d'abord des organes
####
####

# Concat de tous les organes dans un objet
allorgs = concatJsonIntoOne("data/json/organe/*.json")

# Nettoyage (A perfectionner)
orgs16clean = []
for d in allorgs:
    org16dict = {}
    org16dict["id"] = ifExistObject(d["organe"], "uid")
    org16dict["codeType"] = ifExistObject(d["organe"], "codeType")
    org16dict["libelle"] = ifExistObject(d["organe"], "libelle")
    org16dict["libelleEdition"] = ifExistObject(d["organe"], "libelleEdition")
    org16dict["libelleAbrege"] = ifExistObject(d["organe"], "libelleAbrege")
    org16dict["libelleAbrev"] = ifExistObject(d["organe"], "libelleAbrev")
    org16dict["dateDebut"] = ifExistObject(d["organe"]["viMoDe"], "dateDebut")
    org16dict["dateFin"] = ifExistObject(d["organe"]["viMoDe"], "dateFin")
    org16dict["organeParent"] = ifExistObject(d["organe"], "organeParent")
    org16dict["chambre"] = ifExistObject(d["organe"], "chambre")
    org16dict["regime"] = ifExistObject(d["organe"], "regime")
    org16dict["legislature"] = ifExistObject(d["organe"], "legislature")
    org16dict["couleurAssociee"] = ifExistObject(d["organe"], "couleurAssociee")
    orgs16clean.append(org16dict)

# Dataframe clean
orgs = pd.DataFrame(orgs16clean)

####
####
# On s'occupe ensuite des députés
####
####

alldeps = concatJsonIntoOne("data/json/acteur/*.json")

# On ne récupère que les députés de la législature courante
deps16 = []
for d in alldeps:
    is16leg = False
    if isinstance(d["acteur"]["mandats"]["mandat"], list):
        for m in d["acteur"]["mandats"]["mandat"]:
            if m["legislature"] == "16" and m["typeOrgane"] == "ASSEMBLEE":
                is16leg = True
    if is16leg:
        deps16.append(d)

# Nettoyage (à perfectionner)
deps16clean = []
for d in deps16:
    dep16dict = {}
    dep16dict["id"] = d["acteur"]["uid"]["#text"]
    dep16dict["civ"] = d["acteur"]["etatCivil"]["ident"]["civ"]
    dep16dict["prenom"] = d["acteur"]["etatCivil"]["ident"]["prenom"]
    dep16dict["nom"] = d["acteur"]["etatCivil"]["ident"]["nom"]
    dep16dict["trigramme"] = d["acteur"]["etatCivil"]["ident"]["trigramme"]
    dep16dict["dateNais"] = d["acteur"]["etatCivil"]["infoNaissance"]["dateNais"]
    dep16dict["villeNais"] = d["acteur"]["etatCivil"]["infoNaissance"]["villeNais"]
    dep16dict["paysNais"] = d["acteur"]["etatCivil"]["infoNaissance"]["paysNais"]
    deps16clean.append(dep16dict)

# Dataframe clean
deps = pd.DataFrame(deps16clean)

####
####
# On s'occupe des mandats (liens entre un député et un organe)
####
####

# nettoyage (à perfectionner)
deporg16 = []
for d in deps16:
    for m in d["acteur"]["mandats"]["mandat"]:
        deporg16dict = {}
        deporg16dict["id"] = ifExistObject(m, "uid")
        deporg16dict["depId"] = ifExistObject(m, "acteurRef")
        deporg16dict["orgId"] = ifExistObject(m["organes"], "organeRef")
        deporg16dict["legislature"] = ifExistObject(m, "legislature")
        deporg16dict["typeOrgane"] = ifExistObject(m, "typeOrgane")
        deporg16dict["dateDebut"] = ifExistObject(m, "dateDebut")
        deporg16dict["datePublication"] = ifExistObject(m, "datePublication")
        deporg16dict["dateFin"] = ifExistObject(m, "dateFin")
        deporg16dict["codeQualite"] = ifExistObject(m["infosQualite"], "codeQualite")
        deporg16dict["libQualite"] = ifExistObject(m["infosQualite"], "libQualite")
        deporg16dict["libQualiteSex"] = ifExistObject(m["infosQualite"], "libQualiteSex")
        deporg16dict["suppleants"] = ifExistObject(m, "suppleants")
        deporg16.append(deporg16dict)

# Dataframe clean
deporg = pd.DataFrame(deporg16)

# On save tous les df au format csv
deps.to_csv("deputes.csv", index=False)
orgs.to_csv("organes.csv", index=False)
deporg.to_csv("deputes-organes.csv", index=False)
