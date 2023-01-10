import fetch, { Response } from 'node-fetch'

const DEFAULT_RETRY_COUNT = 4
const DEFAULT_INITIAL_DELAY = 1000 // 1 second

export async function fetchWithRetry(url: string): Promise<Response> {
  async function inner(
    retryCount: number = DEFAULT_RETRY_COUNT,
    initialDelay: number = DEFAULT_INITIAL_DELAY,
  ): Promise<Response> {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return response
      } else {
        throw new Error(`HTTP error: ${response.status}`)
      }
    } catch (error) {
      if (retryCount > 0) {
        const delay =
          initialDelay * Math.pow(2, DEFAULT_RETRY_COUNT - retryCount)
        console.log(`Failed to get ${url}, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return inner(retryCount - 1, initialDelay)
      } else {
        throw error
      }
    }
  }

  return inner()
}
