import { useState } from 'react'
import { FilterPills } from '../components/FilterPills'
import { PostCard } from '../components/PostCard'
import type { FeedSource } from '../types'
import { fmtDate, useFeed } from '../useFeed'

type Filter = 'all' | FeedSource

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Instagram', label: 'Instagram' },
  { id: 'X', label: 'X' },
]
const PAGE = 12

export function Feed() {
  const { data, error } = useFeed()
  const [filter, setFilter] = useState<Filter>('all')
  const [limit, setLimit] = useState(PAGE)

  const all = data?.posts ?? []
  const filtered = filter === 'all' ? all : all.filter((p) => p.source === filter)
  const shown = filtered.slice(0, limit)

  return (
    <section aria-labelledby="feed-title">
      <div className="page-head">
        <h1 id="feed-title">Latest posts</h1>
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

      {error && <p className="empty">Couldn't load posts right now.</p>}
      {!error && !data && <p className="empty" aria-live="polite">Loading…</p>}
      {data && shown.length === 0 && <p className="empty">No posts here yet.</p>}

      <ul className="post-grid">
        {shown.map((p) => (
          <li key={p.id}><PostCard post={p} /></li>
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
