# @regna-verkt/claude-skills

Claude Code agent skills for the Regna Verkt MCP server. One install drops four preset workflows into Claude Code so the model knows when to call which Regna tool — lookup, screen, compare, and research over Swedish company data.

Pairs with [`regna-mcp-server`](https://github.com/regna-tech/regna-mcp-server). Install both and Claude Code can answer questions like "Build a one-page research note on Spotify AB" in a single prompt.

## Install

```bash
npx @regna-verkt/claude-skills install
```

Or, before the npm publish lands:

```bash
npx -y github:regna-tech/regna-claude-skills install
```

That writes four directories under `~/.claude/skills/`:

```
~/.claude/skills/
├── regna-lookup/SKILL.md
├── regna-screen/SKILL.md
├── regna-compare/SKILL.md
└── regna-research/SKILL.md
```

Re-running is idempotent: existing files are overwritten with the latest copy from this package.

### Custom install location

```bash
CLAUDE_SKILLS_DIR=/some/path npx @regna-verkt/claude-skills install
# or
npx @regna-verkt/claude-skills install --target /some/path
```

## What each skill does

Every skill is bilingual — triggers on both English and Swedish prompts and mirrors the user's prompt language in the output.

| Skill | Triggers when the user asks to… | Tools it expects |
|---|---|---|
| `regna-lookup` | look up a single Swedish company by name or org number / "slå upp" ett bolag | `lookup_company`, `search_companies`, `validate_org_number` |
| `regna-screen` | filter / screen Swedish companies by industry, revenue, or geography / "screena" eller "filtrera" en lista | `search_companies`, `get_financials`, `get_analysis` |
| `regna-compare` | compare two or more Swedish companies side-by-side / "jämför" två bolag | `lookup_company`, `get_financials`, `get_analysis`, `get_similar_companies` |
| `regna-research` | build a one-page research note on a Swedish company / sammanställ ett PM | every Regna tool |

Each skill is a self-contained `SKILL.md` with YAML frontmatter (Claude Code's standard agent-skills format). Read them in [`skills/`](./skills) — they're plain markdown.

## Prerequisites

- A working `regna-mcp-server` install ([repo](https://github.com/regna-tech/regna-mcp-server)) so Claude Code has the actual tools to call. The skills package only ships prompts and instructions; without the MCP server, Claude has nothing to invoke.
- A Regna API key. [Sign up](https://regnaverkt.com/accounts/signup/) if you don't have one.

## Development

```bash
git clone https://github.com/regna-tech/regna-claude-skills
cd regna-claude-skills
npm install
npm test
```

The tests cover file-copy idempotency, custom-target handling, and frontmatter integrity. No network calls anywhere.

## License

MIT
