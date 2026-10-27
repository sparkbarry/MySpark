/**
 * Pulls your latest posts from social platforms into public/feed/feed.json,
 * and copies their images into public/feed/images/ (Instagram image URLs expire).
 * Bilibili and YouTube uploads go to public/videos/videos.json the same way.
 *
 * Run locally:   IG_ACCESS_TOKEN=... npm run sync-feed
 * In CI:         .github/workflows/sync-feed.yml runs it on a schedule.
 *
 * A source that fails keeps its previously saved posts, so one broken
 * platform never empties the feed.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fetchX } from './x-feed.ts'
import { fetchBilibili, fetchYouTube } from './video-feed.ts'
import type { FeedFile, FeedPost, FeedSource, Video, VideoFile, VideoSource } from '../src/types.ts'

// Local runs read secrets from .env.local (git-ignored); CI passes them as env vars.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const OUT_DIR = path.resolve('public/feed')
const IMG_DIR = path.join(OUT_DIR, 'images')
const FEED_PATH = path.join(OUT_DIR, 'feed.json')
const MAX_POSTS = 60

const VIDEO_DIR = path.resolve('public/videos')
const THUMB_DIR = path.join(VIDEO_DIR, 'thumbs')
const VIDEOS_PATH = path.join(VIDEO_DIR, 'videos.json')
const MAX_VIDEOS = 60

// ---------- Instagram (Instagram API with Instagram Login) ----------
// Needs a Creator/Business account and a long-lived user token.
// Docs: https://developers.facebook.com/docs/instagram-platform

const IG = 'https://graph.instagram.com'

interface IgMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

/** Extends a long-lived token to 60 days from now and returns the token to use. Token must be >24h old. */
async function refreshIgToken(token: string): Promise<string> {
  const res = await fetch(`${IG}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`)
  if (!res.ok) {
    console.warn(`[instagram] token refresh failed (${res.status}) — continuing with current token`)
    return token
  }
  const { access_token, expires_in } = (await res.json()) as { access_token: string; expires_in: number }
  console.log(`[instagram] token valid for ${Math.floor(expires_in / 86400)} more days`)
  if (access_token === token) return token

  // Each refresh returns a new string; the old one still dies on its original date.
  // Locally, save it to .env.local; in CI, hand it to the workflow to update the repo secret.
  if (existsSync('.env.local')) {
    const env = await readFile('.env.local', 'utf8')
    await writeFile('.env.local', env.replace(token, access_token))
    console.log('[instagram] saved refreshed token to .env.local')
  } else if (process.env.GITHUB_ACTIONS) {
    console.log(`::add-mask::${access_token}`)
    await writeFile('.ig-token', access_token)
    console.log('[instagram] refreshed token written for the workflow')
  } else {
    console.warn('[instagram] Meta returned a NEW token string — update the IG_ACCESS_TOKEN secret.')
  }
  return access_token
}

async function fetchInstagram(): Promise<FeedPost[]> {
  if (!process.env.IG_ACCESS_TOKEN) throw new Error('IG_ACCESS_TOKEN not set')
  const token = await refreshIgToken(process.env.IG_ACCESS_TOKEN)

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
  const res = await fetch(`${IG}/me/media?fields=${fields}&limit=${MAX_POSTS}&access_token=${token}`)
  if (!res.ok) throw new Error(`media request failed: ${res.status}`)
  const { data } = (await res.json()) as { data: IgMedia[] }

  const posts: FeedPost[] = []
  for (const m of data) {
    const remote = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url
    posts.push({
      id: `ig-${m.id}`,
      source: 'Instagram',
      date: m.timestamp,
      text: (m.caption ?? '').trim(),
      image: remote ? await saveImage(`ig-${m.id}`, remote) : undefined,
      url: m.permalink,
    })
  }
  return posts
}

// ---------- add more platforms here ----------
// Each fetcher returns FeedPost[] for one source. Register it below.
const sources: Partial<Record<FeedSource, () => Promise<FeedPost[]>>> = {
  Instagram: fetchInstagram,
  X: () => fetchX(saveImage),
}

// Videos have their own page, so they are kept out of the posts feed.
const saveThumb = (name: string, url: string) => saveFile(THUMB_DIR, '/videos/thumbs', name, url)
const videoSources: Record<VideoSource, () => Promise<Video[]>> = {
  Bilibili: () => fetchBilibili(saveThumb),
  YouTube: () => fetchYouTube(saveThumb),
}

// ---------- helpers ----------

const saveImage = (name: string, url: string) => saveFile(IMG_DIR, '/feed/images', name, url)

async function saveFile(dir: string, publicDir: string, name: string, url: string): Promise<string | undefined> {
  const file = path.join(dir, `${name}.jpg`)
  const publicPath = `${publicDir}/${name}.jpg`
  if (existsSync(file)) return publicPath // already downloaded on an earlier run
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    if (!res.ok) throw new Error(String(res.status))
    await writeFile(file, Buffer.from(await res.arrayBuffer()))
    return publicPath
  } catch (e) {
    console.warn(`[image] could not save ${name}: ${e}`)
    return undefined
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T
  } catch {
    return fallback
  }
}

/** Runs every fetcher; a failed one contributes its previously saved items instead. */
async function collect<S extends string, T extends { source: S; date: string }>(
  fetchers: Partial<Record<S, () => Promise<T[]>>>,
  previous: T[],
): Promise<{ items: T[]; anyOk: boolean }> {
  const items: T[] = []
  let anyOk = false
  for (const [source, fetcher] of Object.entries(fetchers) as [S, () => Promise<T[]>][]) {
    try {
      const got = await fetcher()
      console.log(`[${source}] ${got.length} items`)
      items.push(...got)
      anyOk = true
    } catch (e) {
      console.error(`[${source}] failed, keeping previous items${source === 'X' ? '' : `: ${(e as Error).message}`}`)
      if (process.env.GITHUB_ACTIONS) console.warn(`::warning::${source} sync failed; previous items retained. Check credentials and service availability.`)
      items.push(...previous.filter((p) => p.source === source))
    }
  }
  items.sort((a, b) => b.date.localeCompare(a.date))
  return { items, anyOk }
}

async function syncPosts(): Promise<boolean> {
  await mkdir(IMG_DIR, { recursive: true })
  const prev = await readJson<FeedFile>(FEED_PATH, { updatedAt: null, posts: [] })
  const { items, anyOk } = await collect(sources, prev.posts)

  // The repo ships with placeholder posts; drop them once real data arrives.
  const merged = anyOk ? items.filter((p) => !p.id.startsWith('sample-')) : items
  const posts = merged.slice(0, MAX_POSTS)
  const changed = JSON.stringify(posts) !== JSON.stringify(prev.posts)
  const out: FeedFile = {
    updatedAt: anyOk && changed ? new Date().toISOString() : prev.updatedAt,
    posts,
  }
  await writeFile(FEED_PATH, JSON.stringify(out, null, 2) + '\n')
  console.log(`wrote ${out.posts.length} posts to ${path.relative(process.cwd(), FEED_PATH)}`)
  return anyOk
}

async function syncVideos(): Promise<boolean> {
  await mkdir(THUMB_DIR, { recursive: true })
  const prev = await readJson<VideoFile>(VIDEOS_PATH, { updatedAt: null, videos: [] })
  const { items, anyOk } = await collect(videoSources, prev.videos)
  const videos = items.slice(0, MAX_VIDEOS)
  const changed = JSON.stringify(videos) !== JSON.stringify(prev.videos)
  const out: VideoFile = {
    updatedAt: anyOk && changed ? new Date().toISOString() : prev.updatedAt,
    videos,
  }
  await writeFile(VIDEOS_PATH, JSON.stringify(out, null, 2) + '\n')
  console.log(`wrote ${out.videos.length} videos to ${path.relative(process.cwd(), VIDEOS_PATH)}`)
  return anyOk
}

async function main() {
  const postsOk = await syncPosts()
  const videosOk = await syncVideos()
  if (!postsOk && !videosOk) process.exitCode = 1
}

main()
