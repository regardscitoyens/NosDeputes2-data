import path from 'path'
import { CliArgs } from '../utils/cli'
import { rmDirIfExists, runCmd } from '../utils/utils'

export function autoarchiveClone({ workdir }: CliArgs) {
  const datasetName = 'auto_archive_deputes_data'
  console.log(`Cloning ${datasetName} dataset into ${workdir}`)
  const targetDir = path.join(workdir, 'autoarchive')
  rmDirIfExists(targetDir)
  runCmd(
    `git clone https://github.com/implicitdef/${datasetName}.git ${targetDir}`,
  )
  console.log('Done')
}
