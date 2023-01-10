import { createReadStream, createWriteStream } from 'fs'

// Split file into multiple files of maximum N lines
export function splitFileByLines(
  file: string,
  maxLines: number,
): Promise<void> {
  console.log(`Splitting ${file} into parts of ${maxLines} lines max`)
  return new Promise(resolve => {
    const readStream = createReadStream(file, { encoding: 'utf8' })
    let currentLine = 0
    let currentFile = 0
    let currentFileWriteStream = createWriteStream(`${file}.part${currentFile}`)

    // Read by chunks
    readStream.on('data', (data: string) => {
      // split into lines
      const lines = data.split('\n')

      for (const line of lines) {
        currentFileWriteStream.write(`${line}\n`)
        currentLine++
        if (currentLine === maxLines) {
          currentFileWriteStream.end()
          currentLine = 0
          currentFile++
          currentFileWriteStream = createWriteStream(
            `${file}.part${currentFile}`,
          )
        }
      }
    })

    readStream.on('end', () => {
      console.log(`It was split into ${currentFile + 1} files`)
      if (currentFileWriteStream) {
        currentFileWriteStream.end()
      }
      resolve()
    })
  })
}
