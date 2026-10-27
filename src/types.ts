export type TabId = 'home' | 'profile' | 'resume' | 'projects' | 'feed' | 'videos'

export interface Profile {
  handle: string
  realName: string
  nickname: string
  avatar: string
  title: string
  tagline: string
  status: string
  resumePdf?: string
  basics: { label: string; value: string }[]
  skills: string[]
  favorites: { label: string; color: string }[]
  email: string
  socials: { label: string; url: string }[]
}

export interface Episode {
  no: string
  period: string
  title: string
  kind: 'Work' | 'Internship' | 'Education' | 'Other'
  org: string
  description: string
  /** Spell-card style label shown above the title, e.g. "Study Sign". */
  sign: string
}

export type ProjectCategory = 'Web' | 'Game' | 'Tool'

export interface Project {
  title: string
  category: ProjectCategory
  description: string
  tags: string[]
  cover?: string
  /** GitHub stars, shown on the song-select list (omit for new repos). */
  stars?: number
  detailsUrl?: string
  repoUrl?: string
}

export type FeedSource = 'Instagram' | 'X'

export interface FeedPost {
  id: string
  source: FeedSource
  date: string // ISO 8601
  text: string
  image?: string
  images?: { url: string; fromQuote?: boolean }[]
  imageFromQuote?: boolean
  url: string
}

export interface FeedFile {
  updatedAt: string | null
  posts: FeedPost[]
}

export type VideoSource = 'Bilibili' | 'YouTube'

export interface Video {
  id: string
  source: VideoSource
  date: string // ISO 8601
  title: string
  url: string
  thumbnail?: string
  /** Length in seconds, when the platform reports it. */
  duration?: number
}

export interface VideoFile {
  updatedAt: string | null
  videos: Video[]
}
