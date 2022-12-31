import path from 'path'
import { CliArgs } from '../utils/cli'
import {
  downloadZipIntoFileAndUnzipIntoFolder,
  mkDirIfNeeded,
} from '../utils/utils'

// explore the Debats dataset
export async function anFetch(args: CliArgs) {
  const anDir = path.join(args.workdir, 'an')
  mkDirIfNeeded(anDir)
  const legislatureWithDebatsDatasets = [15, 16]
  for (const legislature of legislatureWithDebatsDatasets) {
    const datasetName = `debats${legislature}`
    await downloadZipIntoFileAndUnzipIntoFolder({
      zipUrl: getDownloadUrlDebats(legislature),
      zipFile: path.join(anDir, `${datasetName}.zip`),
      extractionFolder: path.join(anDir, datasetName),
    })
  }
}

function getDownloadUrlDebats(legislature: number) {
  return `https://data.assemblee-nationale.fr/static/openData/repository/${legislature}/vp/syceronbrut/syseron.xml.zip`
}
