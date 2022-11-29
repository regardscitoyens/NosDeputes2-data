import path from 'path'
import { writeToFile } from '../sandbox'
import { CliArgs } from '../utils/cli'

declare global {
  // we use Node v18 native fetch, with node-fetch type definitions
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
  var fetch: typeof import('node-fetch').default
}

const NosDeputesLegislatures = [
  [16, 'www.nosdeputes.fr'],
  [15, '2017-2022.nosdeputes.fr'],
  [14, '2012-2017.nosdeputes.fr'],
  [13, '2007-2012.nosdeputes.fr'],
] as const

type DeputesJsonFileFromNosDeputes = {
  deputes: {
    depute: {
      // there are a bunch of other fields, but it doesn't matter here
      id: number
      nom: string
    }
  }[]
}

export async function nosdeputesFetch({ workdir }: CliArgs) {
  const allDeputesWithLegislature = (
    await Promise.all(
      NosDeputesLegislatures.map(async ([legislature, domain]) => {
        const url = `https://${domain}/deputes/json`
        console.log(`>> ${url}`)
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Bad response from ${url} : ${res.status}`)
        }
        console.log(`<< OK`)
        const json = (await res.json()) as DeputesJsonFileFromNosDeputes
        // remove unnecessary nesting
        const deputes = json.deputes.map(({ depute }: any) => depute)
        // the same depute can be present with different values in each legislature
        // we need to distinguish them
        const deputesWithLegislature: any = deputes.map((depute: any) => ({
          ...depute,
          legislature,
        }))
        return deputesWithLegislature
      }),
    )
  ).flat()
  const filePath = path.join(workdir, 'nosdeputes', 'deputes.json')
  console.log(`Writing to file ${filePath}`)
  writeToFile(filePath, JSON.stringify(allDeputesWithLegislature, null, 2))
}
