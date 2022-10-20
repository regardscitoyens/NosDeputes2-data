import { ChangeEvent, ReactEventHandler, useState, useMemo } from "react";
import {
  FaWikipediaW,
  FaDatabase,
  FaGlobe,
  FaTwitter,
  FaEuroSign,
  FaYoutube,
} from "react-icons/fa";
import { uniq, throttle } from "lodash";
import FuzzySearch from "fuzzy-search";

import { DeputesDataRoot } from ".";
import "./App.css";

import deputesData from "./deputes.json";

const deputes = (deputesData as DeputesDataRoot).results.bindings.sort(
  (a, b) => {
    return a.itemLabel.value.localeCompare(b.itemLabel.value);
  }
);

const simplify = (str: string) =>
  str.normalize("NFKD").replace(/[^\w]/g, "").toLowerCase();

const searcher = new FuzzySearch(
  deputes.map((depute) => ({
    name: depute.itemLabel.value,
    search: simplify(depute.itemLabel.value),
  })),
  ["search"],
  {
    caseSensitive: false,
  }
);

function App() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const selection = useMemo(() => {
    const fuzzy =
      filters.query &&
      searcher.search(simplify(filters.query)).map((res) => res.name);
    return deputes.filter((depute) => {
      if (filters.hideRemplacePar) {
        if (depute.remplaceParLabel?.value) {
          return false;
        }
      }
      if (filters.groupe) {
        if (depute.groupeLabel?.value !== filters.groupe) {
          return false;
        }
      }
      if (filters.district) {
        if (depute.districtLabel?.value !== filters.district) {
          return false;
        }
      }
      if (filters.query) {
        if (fuzzy.length) {
          return fuzzy.includes(depute.itemLabel.value);
        }
        return false;
      }
      return true;
    });
  }, [filters]);

  const onRemplaceParClick = (name: string) => () => {
    setFilters({
      ...filters,
      [name]: !!!filters[name],
    });
  };

  const onGroupeClick = (groupe: string) => () => {
    if (filters.groupe === groupe) {
      setFilters({
        ...filters,
        groupe: undefined,
      });
      return;
    }
    setFilters({
      ...filters,
      groupe,
    });
  };

  const onGroupeSelect = (e: ChangeEvent) => {
    //console.log(e);
    //console.log(e.currentTarget.value);
    setFilters({
      ...filters,
      //@ts-ignore
      groupe: e.currentTarget.value,
    });
  };

  const updateQueryFilter = throttle((query) => {
    if (filters.query !== query) {
      setFilters({
        ...filters,
        query,
      });
    }
  }, 150);

  const onQueryChange: ReactEventHandler = (e) => {
    //@ts-ignore
    console.log(e.currentTarget.value);
    //@ts-ignore
    updateQueryFilter(e.currentTarget.value);
  };

  const badgeStyle = {
    background: "#646cff",
    padding: "2px 5px",
    borderRadius: 3,
    fontSize: "0.8em",
    color: "white",
    margin: "5px 3px 0",
  };
  return (
    <div className="App">
      <h2>Données wikidata des député(e)s de la 16ème legislature</h2>
      <h3>{selection.length} résultats</h3>
      <p>
        <input
          id="hideRemplaceParToggle"
          type="checkbox"
          onClick={onRemplaceParClick("hideRemplacePar")}
        />
        <label htmlFor="hideRemplaceParToggle">
          Masquer les députés remplacés &nbsp;
        </label>
        <select
          onChange={onGroupeSelect}
          style={{ fontSize: "1em", padding: 5, height: 40 }}
        >
          <option value="">Tous les groupes parlementaires</option>
          {uniq(deputes.map((depute) => depute.groupeLabel?.value))
            .sort()
            .filter(Boolean)
            .map((groupe) => (
              <option key={groupe}>{groupe}</option>
            ))}
        </select>
        &nbsp;
        <input
          placeholder="recherche par nom..."
          type="text"
          onChange={onQueryChange}
          style={{
            height: 34,
            width: 200,
            fontSize: "1em",
            textAlign: "center",
          }}
        />
      </p>
      <table style={{ textAlign: "left" }}>
        <thead>
          <tr>
            <th>pic</th>
            <th>Identité</th>
            {/*<th>District</th>*/}
            <th>Groupe</th>
            <th>Liens</th>
          </tr>
        </thead>
        <tbody>
          {selection.map((depute) => (
            <tr
              key={depute.itemLabel.value}
              style={{ opacity: depute.remplaceParLabel?.value ? 0.5 : 1 }}
            >
              <td>
                {/*depute.image?.value ? (
                    <img
                      src={depute.image?.value}
                      title={`Photo de ${depute.itemLabel.value}`}
                      height={100}
                    />
                  ) : null*/}
                -
              </td>
              <td>{depute.itemLabel.value}</td>
              {/*<td>{depute.districtLabel.value}</td>*/}
              <td>
                {depute.groupeLabel?.value ? (
                  <div
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                    onClick={onGroupeClick(depute.groupeLabel?.value)}
                  >
                    {depute.groupeLabel?.value}
                  </div>
                ) : null}
              </td>

              <td>
                {depute.id_an?.value ? (
                  <a
                    style={badgeStyle}
                    href={`https://www2.assemblee-nationale.fr/deputes/fiche/OMC_PA${depute.id_an?.value}`}
                    title={`Fiche Assemblée Nationale`}
                  >
                    AN
                  </a>
                ) : null}
                {depute.id_nosdeputes?.value ? (
                  <a
                    style={badgeStyle}
                    href={`https://nosdeputes.fr/${depute.id_nosdeputes?.value}`}
                    title={`Fiche nosdeputes.fr`}
                  >
                    nosdeputes.fr
                  </a>
                ) : null}
                {depute.id_hatvp?.value ? (
                  <a
                    href={`https://www.hatvp.fr/fiche-nominative/?declarant=${depute.id_hatvp?.value}`}
                    title={`Déclarations Haute autorité pour la transparence de la vie publique`}
                  >
                    <FaEuroSign style={{ margin: "-2px 5px" }} />
                  </a>
                ) : null}
                {depute.twitters.value
                  ? depute.twitters.value
                      .split(";")
                      .map((s) => s.trim())
                      .map((twitter) => (
                        <a
                          key={twitter}
                          href={`https://twitter.com/${twitter}`}
                          title={`Twitter: @${twitter}`}
                        >
                          <FaTwitter style={{ margin: "-2px 5px" }} />
                        </a>
                      ))
                  : null}
                {depute.urls.value
                  ? depute.urls.value
                      .split(";")
                      .map((s) => s.trim())
                      .map((url) => (
                        <a key={url} href={url} title={url}>
                          <FaGlobe style={{ margin: "-2px 5px" }} />
                        </a>
                      ))
                  : null}
                {depute.youtubes.value
                  ? depute.youtubes.value
                      .split(";")
                      .map((s) => s.trim())
                      .map((youtube) => (
                        <a
                          key={youtube}
                          href={`https://www.youtube.com/channel/${youtube}`}
                          title={`Chaine YouTube : ${youtube}`}
                        >
                          <FaYoutube style={{ margin: "-2px 5px" }} />
                        </a>
                      ))
                  : null}
                {depute.wikipedia.value ? (
                  <a
                    href={depute.wikipedia.value}
                    title={`Wikipedia : ${depute.wikipedia.value}`}
                  >
                    <FaWikipediaW style={{ margin: "-2px 5px" }} />
                  </a>
                ) : null}
                <a
                  href={depute.item.value}
                  title={`Wikidata : ${depute.item.value}`}
                >
                  <FaDatabase style={{ margin: "-2px 5px" }} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>Sources: wikidata et wikipedia</p>
    </div>
  );
}

export default App;
