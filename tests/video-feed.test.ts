import assert from 'node:assert/strict'
import test from 'node:test'
import { biliVideo, parseYouTubeFeed } from '../scripts/video-feed.ts'

test('maps a Bilibili archive to a video with canonical link and ISO date', () => {
  const v = biliVideo({ bvid: 'BV1UYxK6NE6u', title: ' [プロセカ] MASTER 31 AP ', pubdate: 1793071394, pic: 'http://i1.hdslb.com/x.jpg', duration: 150 })
  assert.deepEqual(v, {
    id: 'bili-BV1UYxK6NE6u',
    source: 'Bilibili',
    date: '2026-10-27T03:23:14.000Z',
    title: '[プロセカ] MASTER 31 AP',
    url: 'https://www.bilibili.com/video/BV1UYxK6NE6u',
    duration: 150,
  })
  assert.equal(biliVideo({ bvid: '', title: 'x', pubdate: 1, pic: '', duration: 0 }), undefined)
})

test('parses YouTube channel feed entries and decodes XML entities', () => {
  const xml = `<feed><title>SparkBarry</title>
    <entry><yt:videoId>abc_123-XY</yt:videoId><title>Rock &amp; Roll &quot;Oni&quot; &#x2605;</title>
      <published>2026-10-27T17:08:10+00:00</published></entry>
    <entry><yt:videoId>broken</yt:videoId><title>No date</title></entry>
  </feed>`
  assert.deepEqual(parseYouTubeFeed(xml), [{
    id: 'yt-abc_123-XY',
    source: 'YouTube',
    date: '2026-10-27T17:08:10.000Z',
    title: 'Rock & Roll "Oni" ★',
    url: 'https://www.youtube.com/watch?v=abc_123-XY',
  }])
})
