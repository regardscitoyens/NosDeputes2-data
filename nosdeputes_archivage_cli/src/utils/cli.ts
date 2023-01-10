import commandLineArgs, { CommandLineOptions } from 'command-line-args'
import commandLineUsage, { Section, OptionDefinition } from 'command-line-usage'
import { legislatures } from './legislatures'

export type CliArgs = {
  workdir: string
  legislatures: number[]
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
      '{italic Display this help, does nothing else}',
      '$ yarn start {bold --help}',
      '{italic Do the whole process, fetch all the dumps, put them in mysql, spit them out as flat files, etc.}',
      '$ yarn start',
      '{italic Do the whole process but only for one legislature}',
      '$ yarn start {bold --legislature=16}',
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
    }
  }
}
