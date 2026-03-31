import type { Mode } from './types'

const PR_PROMPT = (input: string) => `You are a senior engineer writing a pull request description.

Given this git diff or change description:
${input}

Write a PR description in EXACTLY this format (use the exact section headers):

TITLE:
[One clear imperative sentence — what this PR does]

SUMMARY:
[2-3 sentences: what changed, why, and any important context]

CHANGES:
[Bullet list of the key changes — be specific, reference actual code]

TESTING:
[How a reviewer should test this — specific steps]

NOTES:
[Any gotchas, breaking changes, migration steps, or "None"]

Be direct and specific. Skip filler phrases.`

const COMMIT_PROMPT = (input: string) => `You are a senior engineer writing git commit messages.

Given this git diff or change description:
${input}

Write a commit message following Conventional Commits format:

FORMAT:
[type](scope): [short imperative description]

[Body — optional, 72 char wrap. Explain WHY not WHAT. Use bullet points if multiple things.]

[Footer — optional. Breaking changes, issue refs: "BREAKING CHANGE: ...", "Closes #123"]

Types: feat, fix, refactor, perf, test, docs, chore, style, ci, build

Rules:
- Subject line: 50 chars max, no period, imperative mood
- Scope: the module/component affected (lowercase)
- Body: explain motivation and contrast with previous behaviour
- Be specific — reference actual function names, files, or behaviours

Output the commit message only. No explanation.`

const RELEASE_PROMPT = (input: string) => `You are a technical writer creating release notes.

Given this git diff or change description:
${input}

Write user-facing release notes in EXACTLY this format:

VERSION HIGHLIGHTS:
[1-2 sentences: what's the big story in this release]

WHAT'S NEW:
[Bullet list of new features — user-facing language, benefit-focused]

IMPROVEMENTS:
[Bullet list of improvements and fixes — what got better]

BREAKING CHANGES:
[List any breaking changes with migration steps, or "None"]

Keep it concise. Write for developers who use this project, not the engineers who built it. Lead with value, not implementation detail.`

export function getPrompt(mode: Mode, input: string): string {
  switch (mode) {
    case 'pr':
      return PR_PROMPT(input)
    case 'commit':
      return COMMIT_PROMPT(input)
    case 'release':
      return RELEASE_PROMPT(input)
  }
}
