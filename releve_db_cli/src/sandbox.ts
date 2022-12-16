import { CliArgs } from './utils/cli'
import { AGENDA_14, AGENDA_15, AGENDA_16 } from './utils/datasets'
import { listFilesRecursively, readFileAsJson } from './utils/utils'
import path from 'path'
import lo, { over } from 'lodash'

// Exemple de commande jq pour explorer les fichiers JSON clonés des tricoteuses en ligne de commande
// find ../data.tricoteuses.fr/Agenda_XIV/ -name '*.json' | xargs jq 'select(.timestampDebut < "2017-06-21") | "\(.uid) \(.timestampDebut)"'

export function sandbox(args: CliArgs) {
  const { workdir } = args

  const datasetsAndLegislature = [
    [AGENDA_14, 14],
    [AGENDA_15, 15],
    // [AGENDA_16, 16],
  ] as const

  const acc: {
    uid: string
    filePath: string
    legislature: number
  }[] = []

  for (const [dataset, legislature] of datasetsAndLegislature) {
    const datasetPath = path.join(args.workdir, 'tricoteuses', dataset)
    const files = listFilesRecursively(datasetPath)

    const uids = files.map(file => {
      const json = readFileAsJson(file)
      const uid = json.uid as string
      acc.push({
        uid,
        legislature,
        filePath: file,
      })
      return uid
    })
  }

  const overlap14_15_uids = lo.intersection(
    acc.filter(_ => _.legislature === 14).map(_ => _.uid),
    acc.filter(_ => _.legislature === 15).map(_ => _.uid),
  )

  console.log(
    'intersection',
    overlap14_15_uids.length,
    overlap14_15_uids.slice(0, 5),
  )

  for (const uid of overlap14_15_uids.slice(0, 5)) {
    const data14 = readFileAsJson(
      acc.find(_ => _.legislature === 14 && _.uid === uid)!.filePath,
    )
    const data15 = readFileAsJson(
      acc.find(_ => _.legislature === 15 && _.uid === uid)!.filePath,
    )

    // cheat
    delete data15.xsiType

    const similar = JSON.stringify(data14) === JSON.stringify(data15)
    if (!similar) {
      console.log('')
      console.log('@@@ uid ', uid, `similar ${similar}`)
      console.log(`${uid} 14 ======`)
      console.log(JSON.stringify(data14))
      console.log(`${uid} 15 ======`)
      console.log(JSON.stringify(data15))
    }
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
