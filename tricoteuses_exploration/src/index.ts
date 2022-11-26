import commandLineArgs, { CommandLineOptions } from "command-line-args";
import commandLineUsage, {
  Section,
  OptionDefinition,
} from "command-line-usage";

const optionDefinitions: OptionDefinition[] = [
  {
    name: "workdir",
    type: String,
    description:
      "Relative path to a directory where the datasets will be cloned",
  },
  {
    name: "clone",
    type: Boolean,
    description:
      "Clone the latest datasets in the work directory. If already present, they will be overriden. Default false",
  },
  {
    name: "createtables",
    type: Boolean,
    description:
      "Create the appropriate tables in the DB. If already present, they will be overriden (existing data will be lost). Default false",
  },
  {
    name: "insert",
    type: Boolean,
    description:
      "Inserts the content of the datasets into the tables. Assumes the datasets and tables are present. Deletes existing data in each table before inserting. Default false",
  },
];
const sections: Section[] = [
  {
    header: "My Tricoteuses -> DB regards citoyens script",
    content: [
      "Script to clone Tricoteuses datasets (nettoyes) from their Gitlab and put it in a PostgreSQL database for the new RegardsCitoyens frontend.",
      "By default the script does nothing, you have to activate each step (with --clone for example)",
    ],
  },
  {
    header: "Synopsis",
    content: [
      "$ yarn start {bold --help}",
      "$ yarn start [{bold --clone}] {bold --workdir ./tmp}",
      "$ yarn start [{bold --createtables}] {bold --workdir ./tmp}",
      "$ yarn start [{bold --insert}] {bold --workdir ./tmp}",
      "$ yarn start [{bold --clone}] [{bold --createtables}] [{bold --insert}] {bold --workdir ./tmp}",
    ],
  },
  {
    header: "Options",
    optionList: optionDefinitions,
  },
];

// const allTasks = ["clone", "createtables", "insert"] as const;
// type Task = typeof allTasks[number];

type StructuredArguments = {
  workdir: string;
  clone: boolean;
  createtables: boolean;
  insert: boolean;
};

function parseArgs(): CommandLineOptions | null {
  try {
    return commandLineArgs(optionDefinitions);
  } catch (err) {
    return null;
  }
}

function parseAndCheckArgs(): StructuredArguments | null {
  const args = parseArgs();
  if (!args || Object.keys(args).length === 0) {
    console.error("Invalid arguments. Use --help if you need it.");
    return null;
  }
  if (args.help) {
    console.log(commandLineUsage(sections));
    return null;
  } else {
    console.log("@@@ raw args", args);
    const { workdir } = args;
    if (!workdir || typeof workdir !== "string") {
      console.error(
        "Missing or invalid workdir argument. Use --help if you need it."
      );
      return null;
    }
    return {
      workdir,
      clone: false,
      createtables: false,
      insert: false,
    };
  }
}

console.log(parseAndCheckArgs());

// TODO clone the _nettoye repo

// TODO script to create the DB (tables etc.) (configure.ts)

// TODO populate the DB (update_db.ts)

// TODO live update of amendments ???
