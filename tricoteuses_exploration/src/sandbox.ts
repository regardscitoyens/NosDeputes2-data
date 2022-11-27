import path from 'path'
import fs from 'fs'
import { CliArgs } from './utils/cli'
import { AM030 } from './utils/datasets'

export function sandbox(args: CliArgs) {
  const { workdir } = args

  const subdir = path.join(workdir, AM030, 'acteurs')
  const files = readFilesInSubdir(subdir)
  for (const f of files) {
    const json = readFileAsJson(path.join(subdir, f))
    json.mandats.forEach((mandat: any) => {
      const { organesRefs } = mandat
      if ((organesRefs.length = 1)) {
        console.log(
          `acteur ${json.uid} has mandat ${mandat.uid} ${mandat.xsiType} with organeRefs ${organesRefs}`,
        )
      }
    })
  }
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
