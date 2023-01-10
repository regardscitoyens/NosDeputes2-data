import path from 'path'
import { CliArgs } from './utils/cli'
import { getLegislatureDumpUrl } from './utils/legislatures'
import { downloadFile, mkDirIfNeeded } from './utils/utils'

export async function fetchDumps(args: CliArgs) {
  const { workdir, legislatures } = args
  const dumpsDir = path.join(workdir, 'dumps')
  mkDirIfNeeded(dumpsDir)
  for (const legislature of legislatures) {
    const url = getLegislatureDumpUrl(legislature)
    const filePath = path.join(
      dumpsDir,
      `nosdeputes_dump_legislature${legislature}.sql.gz`,
    )
    await downloadFile(url, filePath)
  }
  console.log('Done')
}
