#!env node
const fs = require("fs");

const query = fs.readFileSync(__dirname + "/query.sparql").toString();

const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
  query
)}`;

fetch(url, {
  headers: { Accept: "application/sparql-results+json" },
})
  .then((r) => r.text())
  .then(console.log);
