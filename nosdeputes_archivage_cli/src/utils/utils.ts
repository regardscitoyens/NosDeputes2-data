import { execSync } from 'child_process'
import fs from 'fs'
import { sql } from 'kysely'
import path from 'path'
import { getDb } from './db'
import glob from 'glob'
import fetch, { Response } from 'node-fetch'
import StreamZip from 'node-stream-zip'
import { XMLParser } from 'fast-xml-parser'
import { writeFileSync } from 'fs'

export function readFromEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`Missing env variable ${name}`)
  }
  return value
}

export function readIntFromEnv(name: string): number {
  const res = parseIntOrNull(readFromEnv(name))
  if (res === null) {
    throw new Error(`env variable ${name} is not a integer`)
  }
  return res
}

function parseIntOrNull(str: string): number | null {
  const parsed = parseInt(str)
  if (isNaN(parsed)) return null
  return parsed
}

export function runCmd(cmd: string) {
  console.log(`>> ${cmd}`)
  execSync(cmd, {
    //env: process.env,
    encoding: 'utf-8',
    stdio: ['ignore', 'ignore', 'pipe'],
  })
}

export function rmDirIfExists(dir: string) {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning directory ${dir} and all its contents`)
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

export function mkDirIfNeeded(dir: string) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory ${dir}`)
    fs.mkdirSync(dir)
  }
}

export function writeToFile(filePath: string, content: string) {
  const directory = path.parse(filePath).dir
  // create the parents directories if needed
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

export function readFileAsJson(filePath: string): any {
  return JSON.parse(
    fs.readFileSync(filePath, {
      encoding: 'utf8',
    }),
  )
}

export function readFileAsXml(filePath: string): any {
  const str = fs.readFileSync(filePath, {
    encoding: 'utf8',
  })
  return new XMLParser().parse(str)
}

export function readFilesInSubdir(subDir: string): string[] {
  console.log(`Reading files in ${subDir}`)
  const filenames = fs.readdirSync(subDir)
  console.log(`${filenames.length} files found`)
  return filenames
}

export async function truncateTable(tableName: string) {
  console.log(`Emptying ${tableName} table`)
  await sql`TRUNCATE TABLE ${sql.raw(tableName)}`.execute(getDb())
}

// The returned file paths will be relative to the current working directory
// (not to the given dirPath)
export function listFilesRecursively(dirPath: string): string[] {
  console.log(`Reading files in ${dirPath} recursively`)
  const filePaths = glob.sync(`${dirPath}/**/*`, { nodir: true })
  console.log(`${filePaths.length} files found`)
  return filePaths
}

export function isNotNull<A>(a: A | null): a is A {
  return a !== null
}

// https://stackoverflow.com/questions/22566379/how-to-get-all-pairs-of-array-javascript
export function getPossiblePairs<A>(arr: A[]): [A, A][] {
  return arr
    .map((a, index) => arr.slice(index + 1).map(w => [a, w]))
    .flat() as any
}

export function withChunkFactor(nbChunks: number): number {
  return Math.max(Math.round(nbChunks * 1), 1)
}

async function httpGetWithoutReadingBody(url: string): Promise<Response> {
  console.log(`>>> GET ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Got ' + response.status)
  }
  console.log('<<<')
  return response
}

export async function downloadZipIntoFileAndUnzipIntoFolder({
  zipUrl,
  zipFile,
  extractionFolder,
}: {
  zipUrl: string
  zipFile: string
  extractionFolder: string
}) {
  const response = await httpGetWithoutReadingBody(zipUrl)
  console.log(`Writing downloaded zip file to ${zipFile}`)
  const fileStream = fs.createWriteStream(zipFile)
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream)
    response.body.on('error', reject)
    fileStream.on('finish', resolve)
  })
  // Extract all of the zip contents to a directory
  console.log(`Extracting to to ${extractionFolder}`)
  rmDirIfExists(extractionFolder)
  fs.mkdirSync(extractionFolder)
  const streamZip = new StreamZip.async({ file: zipFile })
  const extractedEntries = await streamZip.extract(null, extractionFolder)
  console.log(`Extracted ${extractedEntries} entries into ${extractionFolder}`)
  await streamZip.close()
}

export async function downloadFile(url: string, path: string): Promise<void> {
  console.log(`>>> GET ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Got ' + response.status)
  }
  const file = await response.buffer()
  writeFileSync(path, file)
  console.log(`<<<`)
}
