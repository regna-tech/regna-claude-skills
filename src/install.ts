#!/usr/bin/env node
/**
 * Install the Regna agent skills into Claude Code's skill directory.
 *
 * Reads the markdown files from the package's bundled `skills/` directory and
 * writes each one into `<target>/<skill-name>/SKILL.md`. Idempotent — re-runs
 * overwrite cleanly so users can `npx @regna-verkt/claude-skills install` to
 * pick up new versions of the skills.
 */
import { copyFileSync, existsSync, mkdirSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_NAMES = [
  "regna-lookup",
  "regna-screen",
  "regna-compare",
  "regna-research",
] as const;

export interface InstallOptions {
  /** Root directory under which `<skill-name>/SKILL.md` files are written. */
  target: string;
  /** Directory containing the source `<skill-name>.md` files. */
  source: string;
}

export interface InstallResult {
  target: string;
  installed: { name: string; path: string }[];
}

/** Default target — `$CLAUDE_SKILLS_DIR` if set, else `~/.claude/skills`. */
export function defaultTarget(env: NodeJS.ProcessEnv = process.env): string {
  return env.CLAUDE_SKILLS_DIR ?? join(homedir(), ".claude", "skills");
}

/** Default source — the `skills/` directory packaged alongside this module. */
export function defaultSource(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // Compiled module lives at <pkg>/dist/install.js; skills live at <pkg>/skills.
  return resolve(here, "..", "skills");
}

/** Copy each SKILL.md into `<target>/<skill-name>/SKILL.md`. Returns the list. */
export function install(options: InstallOptions): InstallResult {
  const { target, source } = options;
  const installed: { name: string; path: string }[] = [];

  for (const skill of SKILL_NAMES) {
    const src = join(source, `${skill}.md`);
    if (!existsSync(src)) {
      throw new Error(
        `Skill source missing: ${src}. The package may be corrupt — try reinstalling.`,
      );
    }
    const skillDir = join(target, skill);
    mkdirSync(skillDir, { recursive: true });
    const dest = join(skillDir, "SKILL.md");
    copyFileSync(src, dest);
    installed.push({ name: skill, path: dest });
  }

  return { target, installed };
}

function parseArgs(argv: string[]): { command: string; target: string | null } {
  const args = argv.slice(2);
  const command = args[0] ?? "install";
  let target: string | null = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--target" && args[i + 1]) {
      target = args[i + 1] ?? null;
      i++;
    } else if (args[i].startsWith("--target=")) {
      target = args[i].slice("--target=".length);
    }
  }
  return { command, target };
}

function main(): void {
  const { command, target: cliTarget } = parseArgs(process.argv);

  if (command === "--help" || command === "-h" || command === "help") {
    process.stdout.write(
      `Usage: regna-skills install [--target <path>]\n\n` +
        `Drops Regna's Claude Code agent skills into the target directory.\n` +
        `Default target: $CLAUDE_SKILLS_DIR or ~/.claude/skills.\n\n` +
        `Skills installed: ${SKILL_NAMES.join(", ")}.\n`,
    );
    return;
  }

  if (command !== "install") {
    process.stderr.write(
      `Unknown command: ${command}. Run \`regna-skills --help\`.\n`,
    );
    process.exit(2);
  }

  const target = cliTarget ?? defaultTarget();
  const source = defaultSource();

  if (!existsSync(source)) {
    process.stderr.write(
      `Skill source directory not found: ${source}. ` +
        `If you cloned the repo, run \`npm run build\` first.\n`,
    );
    process.exit(1);
  }

  const result = install({ target, source });
  process.stdout.write(
    `Installed ${result.installed.length} skills to ${result.target}:\n`,
  );
  for (const skill of result.installed) {
    process.stdout.write(`  ${skill.name} → ${skill.path}\n`);
  }
  process.stdout.write(
    `\nNext: install regna-mcp-server (https://github.com/regna-tech/regna-mcp-server) ` +
      `so Claude Code has the actual tools to call.\n`,
  );
}

// Detect if invoked as a CLI vs imported as a library.
// `process.argv[1]` is often a `node_modules/.bin` symlink — resolve it to the
// real path before comparing to this module's location.
function isMain(): boolean {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isMain()) {
  main();
}
