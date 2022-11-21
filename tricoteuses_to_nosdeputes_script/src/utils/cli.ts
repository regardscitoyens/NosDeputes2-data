import commandLineArgs, { CommandLineOptions } from 'command-line-args'
import commandLineUsage, { Section, OptionDefinition } from 'command-line-usage'

export type CliArgs = {
  workdir: string
  clone: boolean
  createtables: boolean
  insert: boolean
  sandbox: boolean
}

const optionDefinitions: OptionDefinition[] = [
  {
    name: 'workdir',
    type: String,
    description:
      'Relative path to a directory where the datasets will be cloned',
  },
  {
    name: 'clone',
    type: Boolean,
    description:
      'Clone the latest datasets in the work directory. If already present, they will be overriden. Default false',
  },
  {
    name: 'createtables',
    type: Boolean,
    description:
      'Create the appropriate tables in the DB. If already present, they will be overriden (existing data will be lost). Default false',
  },
  {
    name: 'insert',
    type: Boolean,
    description:
      'Inserts the content of the datasets into the tables. Assumes the datasets and tables are present. Deletes existing data in each table before inserting. Default false',
  },
  {
    name: 'sandbox',
    type: Boolean,
    description: 'Temporary command to explore the JSONs',
  },
  {
    name: 'help',
    type: Boolean,
    description: 'Display this help',
  },
]
const sections: Section[] = [
  {
    header: 'The "Tricoteuses to NosDeputes" script',
    content: [
      'Script to clone Tricoteuses datasets (nettoyes) from their Gitlab and put it in a PostgreSQL database for the new NosDeputes frontend.',
      'By default the script does nothing, you have to activate each step (with --clone for example)',
    ],
  },
  {
    header: 'Synopsis',
    content: [
      '$ yarn start {bold --help}',
      '$ yarn start --workdir ./tmp {bold --clone}',
      '$ yarn start --workdir ./tmp {bold --createtables}',
      '$ yarn start --workdir ./tmp {bold --insert}',
      '$ yarn start --workdir ./tmp {bold --clone} {bold --createtables} {bold --insert}',
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
      clone: args.clone ?? false,
      createtables: args.createtables ?? false,
      insert: args.insert ?? false,
      sandbox: args.sandbox ?? false,
    }
  }
}
