import commandLineArgs, { CommandLineOptions } from 'command-line-args'
import commandLineUsage, { Section, OptionDefinition } from 'command-line-usage'
import { legislatures } from './legislatures'

export type CliArgs = {
  workdir: string
  legislatures: number[]
  fetchDumps: boolean
  sandbox: boolean
}

const optionDefinitions: OptionDefinition[] = [
  {
    name: 'workdir',
    type: String,
    defaultValue: './tmp',
    description:
      'Relative path to a directory where the data will be downloaded then read. Defaults to ./tmp',
  },
  {
    name: 'legislature',
    type: Number,
    description:
      'Limit the work to a given legislature. Ex: --legislature=16. Otherwise all legislatures are processed',
  },
  {
    name: 'fetchDumps',
    type: Boolean,
    description: 'Fetch all the .sql.gz dumps.',
  },
  {
    name: 'all',
    type: Boolean,
    description: 'Run the full process',
  },
  {
    name: 'sandbox',
    type: Boolean,
    description: 'Temporary command to explore some JSONs',
  },
  {
    name: 'help',
    type: Boolean,
    description: 'Display this help',
  },
]
const sections: Section[] = [
  {
    header: 'TBD....',
    content: ['TBD...'],
  },
  {
    header: 'Examples',
    content: [
      '{italic Display this help}',
      '$ yarn start {bold --help}',
      '{italic Fetch the raw SQL dumps and store them in the work directory}',
      '$ yarn start {bold --fetchDumps}',
      '{italic Fetch the raw SQL dump, only for the 16 legislature}',
      '$ yarn start {bold --legislature=16} {bold --fetchDumps} ',
    ],
  },
  {
    header: 'Options',
    optionList: optionDefinitions,
  },
]

function parseArgs(): CommandLineOptions | null {
  try {
    return commandLineArgs(optionDefinitions)
  } catch (err) {
    console.error(err)
    // happens if the user gives a wrong type for an argument
    return null
  }
}

export function parseAndCheckArgs(): CliArgs | null {
  const args = parseArgs()
  const errorMessage =
    'Invalid or missing arguments. Use --help if you need it.'
  if (!args || Object.keys(args).length === 0) {
    console.error(errorMessage)
    return null
  }
  if (args.help) {
    console.log(commandLineUsage(sections))
    return null
  } else {
    const { workdir } = args
    if (!workdir || typeof workdir !== 'string') {
      console.error(errorMessage)
      return null
    }
    return {
      workdir,
      legislatures: args.legislature ? [args.legislature] : legislatures,
      fetchDumps: args.all ?? args.fetchDumps ?? false,
      sandbox: args.sandbox ?? false,
    }
  }
}
