export type Mode = 'pr' | 'commit' | 'release'

export interface ModeConfig {
  id: Mode
  label: string
  icon: string
  desc: string
  outputLabel: string
}

export const MODES: ModeConfig[] = [
  {
    id: 'pr',
    label: 'PR Description',
    icon: '📋',
    desc: 'Title, summary, changes, test plan',
    outputLabel: 'PR Description',
  },
  {
    id: 'commit',
    label: 'Commit Message',
    icon: '✍️',
    desc: 'Conventional commits, scoped',
    outputLabel: 'Commit Message',
  },
  {
    id: 'release',
    label: 'Release Notes',
    icon: '🚀',
    desc: 'User-facing changelog entry',
    outputLabel: 'Release Notes',
  },
]
