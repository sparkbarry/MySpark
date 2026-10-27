import { useState } from 'react'
import { FilterPills } from '../components/FilterPills'
import type { Video, VideoSource } from '../types'
import { fmtDate, useVideos } from '../useFeed'

type Filter = 'all' | VideoSource

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Bilibili', label: 'Bilibili' },
  { id: 'YouTube', label: 'YouTube' },
]
const SRC_COLOR: Record<VideoSource, string> = { Bilibili: '#1F5FD1', YouTube: '#B3122E' }
const PAGE = 12

const fmtDuration = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

function VideoCard({ video }: { video: Video }) {
  return (
    <a className="post video" href={video.url} target="_blank" rel="noreferrer">
      <div className="media">
        {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : <div className="placeholder">{video.source}</div>}
        <span className="src" style={{ background: SRC_COLOR[video.source] }}>{video.source}</span>
        {video.duration ? <span className="duration">{fmtDuration(video.duration)}</span> : null}
      </div>
      <div className="body">
        <time dateTime={video.date}>{fmtDate(video.date)}</time>
        <p>{video.title}</p>
        <span className="post-details-link">Watch on {video.source} →</span>
      </div>
    </a>
  )
}

export function Videos() {
  const { data, error } = useVideos()
  const [filter, setFilter] = useState<Filter>('all')
  const [limit, setLimit] = useState(PAGE)

  const all = data?.videos ?? []
  const filtered = filter === 'all' ? all : all.filter((v) => v.source === filter)
  const shown = filtered.slice(0, limit)

  return (
    <section aria-labelledby="videos-title">
      <div className="page-head">
        <h1 id="videos-title">Latest videos</h1>
        <FilterPills
          label="Filter by platform"
          options={filters}
          value={filter}
          onChange={(f) => {
            setFilter(f)
            setLimit(PAGE)
          }}
        />
      </div>
      <p style={{ margin: '-14px 0 26px', fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>
        {data?.updatedAt ? `Synced automatically · last updated ${fmtDate(data.updatedAt)}` : 'Synced automatically'}
      </p>

      {error && <p className="empty">Couldn't load videos right now.</p>}
      {!error && !data && <p className="empty" aria-live="polite">Loading…</p>}
      {data && shown.length === 0 && <p className="empty">No videos here yet.</p>}

      <ul className="post-grid">
        {shown.map((v) => (
          <li key={v.id}><VideoCard video={v} /></li>
        ))}
      </ul>

      {filtered.length > limit && (
        <div className="more">
          <button type="button" className="pill-btn don" onClick={() => setLimit((n) => n + PAGE)}>
            <span className="kana" aria-hidden="true">ドン</span>
            Load more
          </button>
        </div>
      )}
    </section>
  )
}
