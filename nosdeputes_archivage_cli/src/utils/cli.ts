import commandLineArgs, { CommandLineOptions } from 'command-line-args'
import commandLineUsage, { Section, OptionDefinition } from 'command-line-usage'
import { legislatures } from './legislatures'

export type CliArgs = {
  workdir: string
  legislatures: number[]
  limitGiantExportFileSize: boolean
  doGiantExport: boolean
  doSelectiveExport: boolean
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
    name: 'limitCsvExportFileSize',
    type: Boolean,
    description:
      'When doing the giant CSV export, limit the max CSV size to 30MB. Bigger files will be gzipped. If still too big, they will be split into multiple parts',
  },
  {
    name: 'doGiantExport',
    type: Boolean,
    description:
      'Do the giant CSV export (downloads the dumps, import them into mysql, and export them back as CSV files)',
  },
  {
    name: 'doSelectiveExport',
    type: Boolean,
    description:
      'Reads some selected data from the CSV export (it needs to be run first!), and reexport them as more usable files',
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
      '{italic Do the long process of the giant export : fetch all the dumps, put them in mysql, spit them out as flat CSV files',
      '$ yarn start {bold --doGiantExport}',
      '{italic Same thing but gzip/split files that are too big}',
      '$ yarn start {bold --doGiantExport --limitGiantExportFileSize}',
      '{italic Do the smaller process : read data from the giant export, reexport them in another folder as more readable files }',
      '$ yarn start {bold --doSelectiveExport}',
      '{italic Limit any of these processes to a given legislature }',
      '$ yarn start --doGiantExport {bold --legislature=16} ',
      '$ yarn start --doSelectiveExport {bold --legislature=16} ',
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
      limitGiantExportFileSize: args.limitGiantExportFileSize ?? false,
      doGiantExport: args.doGiantExport ?? false,
      doSelectiveExport: args.doSelectiveExport ?? false,
    }
  }
}
