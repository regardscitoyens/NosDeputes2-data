import { CliArgs } from './utils/cli'
import { listFilesRecursively, readFileAsJson } from './utils/utils'

// Exemple de commande jq pour explorer les fichiers JSON clonés des tricoteuses en ligne de commande
// find ../data.tricoteuses.fr/Agenda_XIV/ -name '*.json' | xargs jq 'select(.timestampDebut < "2017-06-21") | "\(.uid) \(.timestampDebut)"'

export function sandbox(args: CliArgs) {
  const { workdir } = args

  const datasetPath = './tmp/tricoteuses/Agenda_XV'

  const files = listFilesRecursively(datasetPath)
  for (const f of files) {
    const json = readFileAsJson(f)
    const pathInDataset = f
      .substring(datasetPath.length + 1)
      .replace(/\/[^/]*\.json$/, '')
  }

  // XVI

  // dossiers qui changent :
  // SN ou AN
  // l'année
  // le 024-25-etc.
  //
  // ./tmp/tricoteuses/Agenda_XV/AN/R5/L15/S2021/IDS/000/024/RUANR5L15S2021IDS24341.json
  // ./tmp/tricoteuses/Agenda_XV/SN/R5/L15/S2022/IDS/000/025/RUSNR5L15S2022IDS25657.json

  // XVI: toutes les seance sont dans dans un path comme ça
  // ./tmp/tricoteuses/Agenda_XVI/AN/R5/L16/S2022/IDS/000/026/RUANR5L16S2022IDS26177.json

  // TODO check if same depute in NosDeputes can have with different slug in different legislatures
  // ==> OUI examples

  // ----
  //  267042 yannick-favennec
  //  267042 yannick-favennec
  //  267042 yannick-favennec-becot
  //  267042 yannick-favennec-becot
  // ----
  //  719756 christine-cloarec
  //  719756 christine-le-nabour

  // Donc il faudra prendre le slug pour chaque député dans leur dernière législature

  // TODO reorganize that and put it in the CLI. Put the NosDeputes files in subfolder in ./tmp
}

function readDeputesJsonFromNosDeputes(legislature: number) {
  return readFileAsJson(
    `./other/nosdeputes_deputes${legislature}.json`,
  ).deputes.map((_: any) => _.depute) as {
    id: number
    nom: string
    url_an: string
    id_an: string
    slug: string
  }[]
}
