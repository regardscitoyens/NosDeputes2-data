#!env python3
import requests

with open("query.sparql", "r") as file:
    query = file.read()

res = requests.get(
    "https://query.wikidata.org/sparql",
    params={
        "query": query,
    },
    headers={"Accept": "application/sparql-results+json"},
)

print(res.text)
