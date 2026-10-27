import { useEffect, useId, useRef, useState } from 'react'
import type { FeedPost, FeedSource } from '../types'
import { fmtDate } from '../useFeed'

const SRC_COLOR: Record<FeedSource, string> = { Instagram: '#B3122E', X: '#1E1726' }

export function PostCard({ post }: { post: FeedPost }) {
  const images = post.images?.length ? post.images : post.image ? [{ url: post.image, fromQuote: post.imageFromQuote }] : []
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useId()
  const current = images[index % (images.length || 1)]
  const change = (direction: number) => setIndex((n) => (n + direction + images.length) % images.length)
  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => {
      document.body.style.overflow = previous
      trigger?.focus()
    }
  }, [open])

  const gallery = (detail: boolean) => (
    <div className={`media${detail ? ' detail-media' : ''}`}>
      {detail ? (
        current ? <img src={current.url} alt={`${post.source} photo ${index + 1} of ${images.length}`} /> : <div className="placeholder">{post.source}</div>
      ) : (
        <button type="button" className="post-cover" onClick={() => setOpen(true)} aria-label={`Open ${post.source} post details`}>
          {current ? <img src={current.url} alt="" loading="lazy" /> : <div className="placeholder">{post.source}</div>}
        </button>
      )}
      <span className="src" style={{ background: SRC_COLOR[post.source] }}>{post.source}{current?.fromQuote ? ' · Original post image' : ''}</span>
      {images.length > 1 && <>
        <button type="button" className="gallery-arrow prev" aria-label="Previous photo" onClick={() => change(-1)}>‹</button>
        <button type="button" className="gallery-arrow next" aria-label="Next photo" onClick={() => change(1)}>›</button>
        <span className="gallery-count" aria-live="polite">{index + 1} / {images.length}</span>
      </>}
    </div>
  )

  return (
    <>
      <article className="post">
        {gallery(false)}
        <button type="button" className="body post-summary" onClick={() => setOpen(true)} aria-label={`Open ${post.source} post: ${post.text || fmtDate(post.date)}`}>
          <time dateTime={post.date}>{fmtDate(post.date)}</time>
          {post.text && <p>{post.text}</p>}
          <span className="post-details-link">View details →</span>
        </button>
      </article>
      {open && <dialog ref={dialog} className="feed-dialog" aria-labelledby={heading}
        onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (images.length < 2) return
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            change(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
        <div className="feed-detail">
          <header><h2 id={heading}>{post.source} post</h2><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close post details">×</button></header>
          {gallery(true)}
          <div className="detail-body">
            <time dateTime={post.date}>{fmtDate(post.date)}</time>
            {post.text && <p>{post.text}</p>}
            <a href={post.url} target="_blank" rel="noreferrer">View on {post.source} →</a>
          </div>
        </div>
      </dialog>}
    </>
  )
}
