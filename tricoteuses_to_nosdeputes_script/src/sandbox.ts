import fs from 'fs'
import { CliArgs } from './utils/cli'
import _ from 'lodash'
import path from 'path'
import { AM030 } from './utils/datasets'

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

function readFilesInSubdir(subDir: string): string[] {
  console.log(`Reading files in ${subDir}`)
  const filenames = fs.readdirSync(subDir)
  console.log(`${filenames.length} files found`)
  return filenames
}

function readFileAsJson(filePath: string): any {
  return JSON.parse(
    fs.readFileSync(filePath, {
      encoding: 'utf8',
    }),
  )
}

export function writeToFile(filePath: string, content: string) {
  const directory = path.parse(filePath).dir
  // create the parents directories if needed
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
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
