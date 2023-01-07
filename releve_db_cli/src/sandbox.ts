import { XMLParser } from 'fast-xml-parser'
import fs from 'fs'
import nodeTest from 'node:test'
import { CliArgs } from './utils/cli'

// Exemple de commande jq pour explorer les fichiers JSON clonés des tricoteuses en ligne de commande
// find ../data.tricoteuses.fr/Agenda_XIV/ -name '*.json' | xargs jq 'select(.timestampDebut < "2017-06-21") | "\(.uid) \(.timestampDebut)"'

export function sandbox(args: CliArgs) {
  const path = `./tmp/an/debats16/xml/compteRendu/CRSANR5L16S2023O1N051.xml`
  const str = fs.readFileSync(path, {
    encoding: 'utf8',
  })
  const parsed = new XMLParser({
    preserveOrder: true,
    allowBooleanAttributes: true,
    ignoreAttributes: false,
    attributeNamePrefix: '',
    ignoreDeclaration: true,
  }).parse(str)
  const compteRendu = parsed[0].compteRendu
  const uid = findNode(compteRendu, 'uid')[0]['#text']
  const seanceRef = findNode(compteRendu, 'seanceRef')[0]['#text']
  console.log({ uid, seanceRef })

  const contenu = findNode(compteRendu, 'contenu')
  console.log('contenu', contenu)
}

function findNode(nodes: any[], name: string): any {
  const child = nodes.find(_ => typeof _[name] !== 'undefined')
  return child ? child[name] : null
}
