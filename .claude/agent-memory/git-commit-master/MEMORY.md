# Git Commit Master - Agent Memory

## Project .claude/ Layout Convention

All Claude agent definitions and their persistent memories live under the
project-root `.claude/` directory — NOT in subproject subdirectories:

- Agent definitions: `.claude/agents/<agent-name>.md`
- Agent memory:     `.claude/agent-memory/<agent-name>/MEMORY.md`

Confirmed agents: `angular-build-fixer`, `angular-federation-expert`, `git-commit-master`.
If a future session finds agent files under `frontend/.claude/` or any other
subdirectory, they should be flagged as misplaced.

## Files That Tend to Change Together

- `.claude/agents/<name>.md` + `.claude/agent-memory/<name>/MEMORY.md` — always
  co-located; moves/renames affect both together.
- `.claude/settings.local.json` — may change alongside agent relocations when
  new Bash permission entries are needed for project-scope operation.

## Pre-commit Check Shortcuts

- `.claude/` config-only changes: no build checks required (no Java, Angular, or
  Docker Compose files affected).
- `settings.local.json` only: whitespace check (`git diff --check`) is sufficient.
