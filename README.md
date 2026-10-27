# MySpark

Vite + React + TypeScript. Manga-panel look, tabbed sections (Home / Feed / Videos / Profile / Résumé / Projects),
a social feed synced from Instagram and X, and a video list synced from Bilibili and YouTube on a schedule.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
```

## Where to edit

| What | File |
| --- | --- |
| Name, intro, skills, contacts, résumé, projects | `src/data/site.ts` |
| Colors, fonts, layout | `src/index.css` (tokens at the top) |
| Avatar | `public/avatar.jpg` |
| Résumé PDF | put it at `public/resume.pdf` and set `resumePdf: '/resume.pdf'` (buttons stay hidden until then) |
| Header lane art (notes, drum, judge circle, backgrounds) | `public/lane/`, from OurTaikoPlay by OurTaiko |
| Project screenshots | put in `public/projects/` and set `cover: '/projects/x.jpg'` |

Tabs live in the URL hash (`/#/projects`), so every tab can be linked to directly and Back works.

## Social feed

`scripts/sync-feed.ts` writes `public/feed/feed.json` and saves images into `public/feed/images/`.
The site only reads that JSON — no tokens ever reach the browser.

### Instagram setup (once)

1. In the Instagram app, switch your account to a **Creator** or **Business** account (free).
2. At developers.facebook.com create an app → add the **Instagram** product →
   "API setup with Instagram login" → add your account as a tester and generate an access token.
   This gives a long-lived token (valid 60 days, refreshable).
3. Try it locally: `IG_ACCESS_TOKEN=xxxx npm run sync-feed`
4. In your GitHub repo: Settings → Secrets and variables → Actions → add two secrets:
   - `IG_ACCESS_TOKEN` — the token (copy the current value from `.env.local`; local runs keep it up to date).
   - `GH_PAT` — a fine-grained personal access token limited to this repo with
     **Secrets: Read and write** permission. The workflow uses it to store the refreshed Instagram token,
     because Meta returns a new token string on every refresh.

`.github/workflows/sync-feed.yml` then runs every 6 hours (or on demand from the Actions tab),
refreshes the token, and commits the new `feed.json` — your host (Vercel / Cloudflare Pages) redeploys on that commit.

### Videos (Bilibili and YouTube)

The **Videos** tab reads `public/videos/videos.json`, written by the same sync script
(`scripts/video-feed.ts`) with thumbnails saved into `public/videos/thumbs/`. Neither source needs a key:

- **Bilibili** — the public `x/series/recArchivesByKeywords` endpoint, which lists a user's uploads
  without the WBI signing that the space page's own API needs. Set the account in `BILIBILI_MID`.
- **YouTube** — the channel's public Atom feed (`/feeds/videos.xml?channel_id=...`), which holds the
  15 latest uploads. Set the channel in `YOUTUBE_CHANNEL_ID`.

Bilibili sometimes answers with HTTP 412 (risk control) for server IPs. As with the other sources, a
failed run keeps the previously saved videos and the next scheduled run tries again.

## Deploy

Any static host works. On Vercel or Cloudflare Pages: build command `npm run build`, output `dist`.

### X / Twitter (original posts only)

The same scheduled workflow also reads `@spark_barry`'s latest personal timeline
using `@the-convocation/twitter-scraper@0.22.3`, the library used by Twitter-Scraper.
It scans up to 100 timeline entries, excludes replies and reposts, verifies the
post's author, and keeps quote posts. All attached and quoted-post photos are
saved locally, with duplicate URLs removed. Each photo retains its attribution;
quoted images show an “Original post image” badge. Cards show a centered 4:3
carousel. Clicking a card opens the full text and uncropped photos in a modal,
with the original-platform link inside the modal. The modal supports previous /
next controls, arrow keys, Escape, and backdrop dismissal. Old single-image feed
entries remain compatible. Videos are available through the original-post link.
The combined feed retains its existing 60-post limit across all platforms.

GitHub repository → Settings → Secrets and variables → Actions:

- Add the **secret** `TWITTER_COOKIES`: paste your logged-in X cookie header
  (`auth_token=...; ct0=...`) or an exported JSON cookie array. Never commit it.
- Optionally add the **variable** `X_USERNAME` to override `spark_barry`.
- Open Actions → **Sync social feed** → **Run workflow** for the first sync.

The existing schedule runs every six hours and commits the generated public
feed and images. Cookie expiry, rate limits, or an X request failure preserve the
previous X snapshot and produce an Actions warning. Refresh `TWITTER_COOKIES`
when needed. A successful source can still publish when another source fails.
This uses X's undocumented web API; GitHub-hosted runners may be blocked by X,
and X restricts non-official automation. No live success is guaranteed by a build.

For a local run, add `TWITTER_COOKIES` (and optionally `X_USERNAME`) to the ignored
`.env.local`, then run `npm run sync-feed`. Only public post data is written into
`public/feed`; cookies stay in the server-side sync process.
