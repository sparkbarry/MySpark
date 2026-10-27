import type { Video } from '../src/types.ts'

export const BILIBILI_MID = '5198313'
export const YOUTUBE_CHANNEL_ID = 'UCXWLG3D7ZXArgtDE__C6xFQ'
const PER_SOURCE = 30

type SaveImage = (name: string, url: string) => Promise<string | undefined>

// ---------- Bilibili ----------
// The space page's upload list (x/space/wbi/arc/search) needs WBI signing and is
// risk-controlled, but this public endpoint returns the same uploads, newest first.

interface BiliArchive {
  bvid: string
  title: string
  pubdate: number // unix seconds
  pic: string
  duration: number // seconds
}

export function biliVideo(a: BiliArchive): Video | undefined {
  if (!a.bvid || !a.title || !Number.isFinite(a.pubdate)) return
  return {
    id: `bili-${a.bvid}`,
    source: 'Bilibili',
    date: new Date(a.pubdate * 1000).toISOString(),
    title: a.title.trim(),
    url: `https://www.bilibili.com/video/${a.bvid}`,
    duration: a.duration || undefined,
  }
}

export async function fetchBilibili(saveImage: SaveImage): Promise<Video[]> {
  const url = `https://api.bilibili.com/x/series/recArchivesByKeywords?mid=${BILIBILI_MID}&keywords=&ps=${PER_SOURCE}&pn=1`
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new Error(`archive request failed: ${res.status}`)
  const body = await res.text()
  // When it is throttled, Bilibili answers 200 with an HTML error page instead of JSON.
  if (!body.startsWith('{')) throw new Error('archive request was throttled')
  const json = JSON.parse(body) as { code: number; message: string; data?: { archives?: BiliArchive[] } }
  if (json.code !== 0) throw new Error(`archive request failed: ${json.code} ${json.message}`)

  const videos: Video[] = []
  for (const a of json.data?.archives ?? []) {
    const v = biliVideo(a)
    if (!v) continue
    // Covers are served over http and full size; ask for a https 16:9 thumbnail.
    const cover = a.pic && `${a.pic.replace(/^http:/, 'https:')}@640w_360h_1c.jpg`
    videos.push({ ...v, thumbnail: cover ? await saveImage(v.id, cover) : undefined })
  }
  return videos
}

// ---------- YouTube ----------
// The channel's public Atom feed lists its 15 latest uploads; no API key needed.

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
const decode = (s: string) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(Number(e[1].toLowerCase() === 'x' ? `0${e.slice(1)}` : e.slice(1))) : ENTITIES[e] ?? m)

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return m ? decode(m[1]).trim() : undefined
}

export function parseYouTubeFeed(xml: string): Video[] {
  const videos: Video[] = []
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = tag(entry, 'yt:videoId')
    const title = tag(entry, 'title')
    const published = tag(entry, 'published')
    const date = published ? new Date(published) : undefined
    if (!id || !title || !date || !Number.isFinite(date.getTime())) continue
    videos.push({
      id: `yt-${id}`,
      source: 'YouTube',
      date: date.toISOString(),
      title,
      url: `https://www.youtube.com/watch?v=${id}`,
    })
  }
  return videos
}

export async function fetchYouTube(saveImage: SaveImage): Promise<Video[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`, {
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`channel feed request failed: ${res.status}`)
  const videos = parseYouTubeFeed(await res.text())
  for (const v of videos) {
    // mqdefault is 16:9 without the letterbox bars that hqdefault has.
    v.thumbnail = await saveImage(v.id, `https://i.ytimg.com/vi/${v.id.slice(3)}/mqdefault.jpg`)
  }
  return videos
}
