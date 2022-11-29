import fs from 'fs'
import { CliArgs } from './utils/cli'
import _ from 'lodash'
import path from 'path'
import { AM030 } from './utils/datasets'
import { readFileAsJson, readFilesInSubdir } from './utils/utils'
import { sql } from 'kysely'
import { getDb } from './utils/db'

export function sandbox(args: CliArgs) {
  const { workdir } = args

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

  const deputesWithLegislature = [13, 14, 15, 16].flatMap(legislature => {
    const deputes = readDeputesJsonFromNosDeputes(legislature)
    return deputes.map(depute => ({ ...depute, legislature }))
  })

  const subdir = path.join(workdir, AM030, 'acteurs')
  const files = readFilesInSubdir(subdir)
  for (const f of files) {
    const json = readFileAsJson(path.join(subdir, f))
  }

  deputesWithLegislature.forEach(depute => {
    if (!files.includes(`PA${depute.id_an}.json`)) {
      console.log('not found', depute.id_an, depute.slug, depute.legislature)
    }
  })
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
