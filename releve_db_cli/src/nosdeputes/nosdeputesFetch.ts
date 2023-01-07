import fetch from 'node-fetch'
import path from 'path'
import { CliArgs } from '../utils/cli'
import { writeToFile, rmDirIfExists } from '../utils/utils'

const nosDeputesLegislatures = [
  [16, 'www.nosdeputes.fr'],
  [15, '2017-2022.nosdeputes.fr'],
  [14, '2012-2017.nosdeputes.fr'],
  [13, '2007-2012.nosdeputes.fr'],
] as const

type DeputesJsonFileFromNosDeputes = {
  deputes: {
    depute: Depute
  }[]
}
type Depute = {
  // there are a bunch of other fields, but it doesn't matter here
  id: number
  slug: string
}

export async function nosdeputesFetch(args: CliArgs) {
  await nosdeputesFetchDeputes(args)
  await nosdeputesFetchStats(args)
}

export async function nosdeputesFetchDeputes({ workdir }: CliArgs) {
  const allDeputesWithLegislature = (
    await Promise.all(
      nosDeputesLegislatures.map(async ([legislature, domain]) => {
        const deputes = await fetchDeputes(domain)
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

export async function nosdeputesFetchStats({ workdir }: CliArgs) {
  const statsDir = path.join(workdir, 'nosdeputes', 'stats')
  rmDirIfExists(statsDir)
  // before legislature 15, the endpoint is different, weekly stats don't seem available
  const FIRST_LEGISLATURE_WITH_ACCESSIBLE_STATS = 15
  for (const [legislature, domain] of nosDeputesLegislatures) {
    if (legislature >= FIRST_LEGISLATURE_WITH_ACCESSIBLE_STATS) {
      const deputes = await fetchDeputes(domain)
      for (const depute of deputes) {
        const { slug } = depute
        const stats = await fetchStatsOfDepute(domain, slug)
        // add legislature and slug in the content, it will be easier to process
        const finalContent = { ...stats, legislature, slug }
        const filePath = path.join(statsDir, `${legislature}_${slug}.json`)
        console.log(`Writing to file ${filePath}`)
        writeToFile(filePath, JSON.stringify(finalContent, null, 2))
      }
    }
  }
}

async function fetchDeputes(domain: string): Promise<Depute[]> {
  const url = `https://${domain}/deputes/json`
  console.log(`>> ${url}`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Bad response from ${url} : ${res.status}`)
  }
  console.log(`<< OK`)
  const json = (await res.json()) as DeputesJsonFileFromNosDeputes
  // remove unnecessary nesting
  return json.deputes.map(({ depute }) => depute)
}

async function fetchStatsOfDepute(domain: string, slug: string) {
  const url = `https://${domain}/${slug}/graphes/legislature/total?questions=true&format=json`
  console.log(`>> ${url}`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Bad response from ${url} : ${res.status}`)
  }
  console.log(`<< OK`)
  const json = await res.json()
  return json
}
