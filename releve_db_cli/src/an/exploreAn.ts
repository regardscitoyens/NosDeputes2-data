// import fetch, { Response } from 'node-fetch'
// import path from 'path'
// import fs from 'fs'
// import { CliArgs } from '../utils/cli'

// // explore the Debats dataset
// export async function exploreAnOpenData(args: CliArgs) {
//   const DEBATS_16 =
//     'https://data.assemblee-nationale.fr/static/openData/repository/16/vp/syceronbrut/syseron.xml.zip'

//   const datasetName = 'debats16'
//   const datasetUrl = DEBATS_16
//   const response = await httpGetWithoutReadingBody(datasetUrl)

//   const zippedFilePath = path.join(args.workdir, 'an', `${datasetName}.zip`)

//   console.log(`Writing downloaded zip file to ${zippedFilePath}`)
//   const fileStream = fs.createWriteStream(zippedFilePath)
//   await new Promise((resolve, reject) => {
//     response.body.pipe(fileStream)
//     response.body.on('error', reject)
//     fileStream.on('finish', resolve)
//   })
// }

// async function httpGetWithoutReadingBody(url: string): Promise<Response> {
//   console.log(`>>> GET ${url}`)
//   const response = await fetch(url)
//   if (!response.ok) {
//     throw new Error('Got ' + response.status)
//   }
//   console.log('<<<')
//   return response
// }
