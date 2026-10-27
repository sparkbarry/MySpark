// All of the site's hand-written content lives here.
// Anything still in [brackets] is a placeholder waiting for your text.
import type { Episode, Profile, Project } from '../types'

export const profile: Profile = {
  handle: 'KirisameVanilla',
  realName: 'Chengwen Yang',
  nickname: 'Barry',
  avatar: '/avatar.jpg',
  title: 'Ordinary Programmer',
  tagline: 'CS grad student at NYU. I build rhythm-game tools, game plugins and web apps.',
  status: 'Grinding algorithms',
  // Set to '/resume.pdf' (and add public/resume.pdf) to show the download buttons.
  resumePdf: undefined,
  basics: [
    { label: 'Role', value: 'MSCS student @ NYU' },
    { label: 'Based in', value: 'New York' },
    { label: 'Languages', value: 'Chinese, English, learning Japanese' },
  ],
  skills: ['TypeScript', 'C#', 'Python', 'Unity', 'Vue', 'Svelte'],
  favorites: [
    { label: 'Taiko no Tatsujin', color: '#F2542D' },
    { label: 'Project Sekai', color: '#33CCBB' },
    { label: 'FFXIV', color: '#5468C8' },
    { label: 'Arknights', color: '#1E1726' },
    { label: 'Wuthering Waves', color: '#D7263D' },
    { label: 'Touhou', color: '#F4C430' },
  ],
  email: 'barry.yang.us@outlook.com',
  socials: [
    { label: 'Instagram', url: 'https://www.instagram.com/spark_barry/' },
    { label: 'Twitter', url: 'https://x.com/spark_barry' },
    { label: 'GitHub', url: 'https://github.com/KirisameVanilla' },
    { label: 'Bilibili', url: 'https://space.bilibili.com/5198313' },
    { label: 'YouTube', url: 'https://www.youtube.com/@spark_barry' },
  ],
}

// "Chengwen (Barry) Yang" — nickname in parentheses after the given name.
export const fullName = profile.realName.replace(' ', ` (${profile.nickname}) `)

// Newest first.
export const episodes: Episode[] = [
  {
    no: 'EP.04',
    period: '2026 – now',
    title: 'M.S. in Computer Science',
    kind: 'Education',
    org: 'New York University',
    sign: 'Study Sign',
    description: 'Still exploring where to dig in.',
  },
  {
    no: 'EP.03',
    period: 'Jul – Nov 2025',
    title: 'Python Developer, Industrial Software',
    kind: 'Internship',
    org: 'Shanghai Trusted Industrial Control Platform Co., Ltd.',
    sign: 'Build Sign',
    description: 'Built and delivered MatlabIDE, a desktop IDE built with Python and PySide6.',
  },
  {
    no: 'EP.02',
    period: 'Jul – Aug 2024',
    title: 'Security Assessment Engineer (Backend)',
    kind: 'Internship',
    org: 'Sichuan Xinwang Bank Co., Ltd.',
    sign: 'Guard Sign',
    description: 'Learned how common backend vulnerabilities arise and how to prevent them.',
  },
  {
    no: 'EP.01',
    period: '2022 – 2026',
    title: 'B.Eng. in Software Engineering',
    kind: 'Education',
    org: 'East China Normal University',
    sign: 'Cipher Sign',
    description: 'Cryptography & network security track: number theory, group theory, cryptanalysis and steganography.',
  },
]

export const projects: Project[] = [
  {
    title: 'Radar',
    stars: 37,
    cover: '/projects/radar.jpg',
    category: 'Tool',
    description: 'A Dalamud plugin for FFXIV.',
    tags: ['C#', 'Dalamud'],
    repoUrl: 'https://github.com/KirisameVanilla/Radar',
  },
  {
    title: 'OurTaiko Play',
    stars: 8,
    cover: '/projects/ourtaiko-play.jpg',
    category: 'Game',
    description: 'Taiko chart player built with Unity 2D and C#.',
    tags: ['Unity', 'C#'],
    detailsUrl: 'https://play.ourtaiko.org',
    repoUrl: 'https://github.com/OurTaiko/OurTaikoPlay',
  },
  {
    title: 'OurTaiko Fanmade Web',
    cover: '/projects/ourtaiko-fanmade.jpg',
    category: 'Web',
    description: 'Community site for sharing fan-made Taiko charts, with a React + TypeScript frontend and a Go + PostgreSQL backend.',
    tags: ['React', 'TypeScript', 'Go', 'PostgreSQL'],
    detailsUrl: 'https://fanmade.ourtaiko.org/',
    repoUrl: 'https://github.com/OurTaiko/FanmadeFrontend',
  },
  {
    title: 'MajdataNet',
    stars: 15,
    cover: '/projects/majdatanet.jpg',
    category: 'Web',
    description: 'Frontend of Majdata, a website for fan-made maimai charts.',
    tags: ['TypeScript'],
    detailsUrl: 'https://majdata.net/',
    repoUrl: 'https://github.com/TeamMajdata/MajdataNet',
  },
  {
    title: 'MajdataHub',
    stars: 23,
    category: 'Tool',
    description: 'A set of small utilities for Majdata.',
    tags: ['TypeScript'],
    repoUrl: 'https://github.com/KirisameVanilla/MajdataHub',
  },
]
