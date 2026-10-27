import { useState } from 'react'
import { profile } from '../data/site'
import type { TabId } from '../types'
import { TABS, tabHref } from '../useHashTab'
import { Drum, FaceNote, type NoteKind } from './Lane'

// Each section is a note on the lane. Big notes mark the current page, like 大音符.
const NOTE_KIND: Record<TabId, NoteKind> = {
  home: 'don',
  profile: 'ka',
  resume: 'don',
  projects: 'ka',
  feed: 'don',
  videos: 'ka',
}

// OurTaikoPlay's play screen: festival strip with the "song title", then the
// player panel (nameplate + drum) beside the note lane and its label rail.
export function Header({ tab }: { tab: TabId }) {
  const [hover, setHover] = useState<NoteKind | null>(null)
  const current = TABS.find((t) => t.id === tab)!

  return (
    <header className="play-header">
      <div className="festival">
        <a className="brand" href="#/">
          <strong>{profile.handle}</strong>
          <span>Rhythm &amp; Magic</span>
        </a>
        <p className="song-title" aria-hidden="true">{current.title}</p>
      </div>

      <nav className="playfield" aria-label="Site sections">
        <div className="player">
          <div className="plate">
            <span className="tag">1P</span>
            <span className="who">{profile.nickname}</span>
          </div>
          <Drum hit={hover ?? NOTE_KIND[tab]} />
        </div>

        <div className="lane">
          <div className="track">
            <span className="judge" aria-hidden="true" />
            {TABS.map((t) => {
              const on = t.id === tab
              return (
                <a
                  key={t.id}
                  className={on ? 'lane-note big' : 'lane-note'}
                  href={tabHref(t.id)}
                  aria-current={on ? 'page' : undefined}
                  onMouseEnter={() => setHover(NOTE_KIND[t.id])}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(NOTE_KIND[t.id])}
                  onBlur={() => setHover(null)}
                >
                  <span className="disc"><FaceNote kind={NOTE_KIND[t.id]} big={on} /></span>
                  <span className="lane-label">{t.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </header>
  )
}
