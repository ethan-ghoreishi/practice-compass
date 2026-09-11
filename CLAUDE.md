@AGENTS.md

# Claude Code notes

Everything normative for this repository lives in `AGENTS.md` (cross-provider,
imported above) and `DECISIONS.md` (the dated "why"). Edit AGENTS.md, never this
file, for anything a non-Claude agent also needs. This file holds only what is
specific to Claude Code:

- This repo is under Prismatica `govern` mode (`.prismatica/config.json`). Inside
  a framed lane the `prismatica-contract-work` skill auto-activates: stay inside
  the contract's scope, prove work with real tests, and hand owner-only commands
  (`merge`, `ship`, approvals) back to the owner rather than running them.
- The signed rule set is `.prismatica/rules.md`. It is owner-approved — never edit
  it to make a change pass.
- `.claude/launch.json` defines the dev (`npm run dev`, port 5173) and preview
  (`npm run preview`, port 4173) launch configurations.
