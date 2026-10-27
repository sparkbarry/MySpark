import { useEffect, useState } from 'react'
import type { FeedFile, VideoFile } from './types'

const cache = new Map<string, Promise<unknown>>()

/** Loads a JSON file written by scripts/sync-feed.ts once and shares it between pages. */
function useSynced<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let request = cache.get(url)
    if (!request) {
      request = fetch(url, { cache: 'no-cache' }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      cache.set(url, request)
    }
    let alive = true
    request.then(
      (d) => alive && setData(d as T),
      () => {
        cache.delete(url)
        if (alive) setError(true)
      },
    )
    return () => {
      alive = false
    }
  }, [url])

  return { data, error }
}

export const useFeed = () => useSynced<FeedFile>('/feed/feed.json')
export const useVideos = () => useSynced<VideoFile>('/videos/videos.json')

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
