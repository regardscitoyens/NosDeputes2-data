import path from 'path'
import { CliArgs } from '../utils/cli'
import { datasetsToClone } from '../utils/datasets'
import { rmDirIfExists, runCmd } from '../utils/utils'

export function tricoteusesClone({ workdir }: CliArgs) {
  const datasets = datasetsToClone
  console.log(`Cloning ${datasets.length} dataset(s) into ${workdir}`)
  datasets.forEach(name => {
    const targetDir = path.join(workdir, 'tricoteuses', name)
    rmDirIfExists(targetDir)
    runCmd(
      `git clone https://git.en-root.org/tricoteuses/data/assemblee-nettoye/${name}_nettoye.git ${targetDir}`,
    )
  })
  console.log('Done')
}
