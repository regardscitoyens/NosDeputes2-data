import pandas as pd
import sys
import unicodedata


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

orgDico = {
    "API": "Assemblée parlementaire internationale",
    "ASSEMBLEE": "Assemblée nationale",
    "CJR": "Cour de justice de la République",
    "CMP": "Commissions mixtes paritaires",
    "CNPE": "Commissions d’enquêtes",
    "CNPS": "Commissions spéciales",
    "COMNL": "Autres commissions permanentes",
    "COMPER": "Commissions permanentes législatives",
    "COMSENAT": "Commissions sénatoriales",
    "COMSPSENAT": "Commissions spéciales sénatoriales",
    "CONFPT": "Conférence des présidents",
    "CONSTITU": "Conseil constitutionnel",
    "DELEGBUREAU": "Délégation du Bureau (de l’Assemblée Nationale)",
    "DELEG": "Délégation parlementaire",
    "DELEGSENAT": "Délégation sénatoriale",
    "GA": "Groupe d’amitié",
    "GE": "Groupe d’études",
    "GEVI": "Groupe d’études à vocation internationale",
    "GOUVERNEMENT": "Gouvernement",
    "GP": "Groupe politique",
    "GROUPESENAT": "Groupe sénatorial",
    "HCJ": "Haute Cour de justice",
    "MINISTERE": "Ministère",
    "MISINFOCOM": "Missions d’information communes",
    "MISINFO": "Missions d’informations",
    "MISINFOPRE": "Missions d’information de la conférence des Présidents",
    "OFFPAR": "Office parlementaire ou délégation mixte",
    "ORGAINT": "Organisme international",
    "ORGEXTPARL": "Organisme extra parlementaire",
    "PARPOL": "Parti politique",
    "PRESREP": "Présidence de la République",
    "SENAT": "Sénat"
}


def main():
    if len(sys.argv) > 1:
        depName = strip_accents(sys.argv[1])
    else:
        print("Ajouter le nom d'un député - python carte-visite.py \"NOM DEPUTE\"")
        return

    deps = pd.read_csv("deputes.csv", dtype=str)
    orgs = pd.read_csv("organes.csv", dtype=str)
    deporg = pd.read_csv("deputes-organes.csv", dtype=str)
    deps["complete_name"] = deps["prenom"] + " " + deps["nom"]
    deps["complete_name"] = deps["complete_name"].apply(lambda x: strip_accents(x))

    try:
        for index, row in deps[deps['complete_name'].str.lower().str.contains(depName)].iterrows():
            depId = row["id"]

            dep = deps[deps["id"] == depId][:1].to_dict(orient="records")[0]
            print("----")
            print("----")
            print(dep["civ"] + " " + dep["prenom"] + " " + dep["nom"] + " né(e) le " + dep["dateNais"] + " à " + dep["villeNais"])
            print(" ")

            inter = deporg[(deporg["depId"] == depId) & (deporg["legislature"] == "16")].sort_values(
                by=["dateDebut", "dateFin"], ascending=[False, False]
            )

            for index, row in inter.iterrows():
                if row["dateFin"] == row["dateFin"]:
                    fin = " à " + row["dateFin"]
                else:
                    fin = " jusqu'à ce jour"
                organe = orgs[orgs["id"] == row["orgId"]]["libelle"].iloc[0]
                print("- " + row["codeQualite"] + " de " + organe + " (" + orgDico[row["typeOrgane"]] + ")" + " du " + row["dateDebut"] + fin)        
            print("----")
            print("----")
    except IndexError:
        print("Pas de député trouvé :(")


if __name__ == '__main__':
    main()
