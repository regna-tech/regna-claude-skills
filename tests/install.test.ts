import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { SKILL_NAMES, defaultTarget, install } from "../src/install.ts";

function setupSourceDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "regna-skills-src-"));
  for (const name of SKILL_NAMES) {
    writeFileSync(
      join(dir, `${name}.md`),
      `---\nname: ${name}\ndescription: stub for ${name}\n---\n# ${name}\n`,
    );
  }
  return dir;
}

function setupEmptyTargetDir(): string {
  return mkdtempSync(join(tmpdir(), "regna-skills-target-"));
}

test("install drops every named skill into <target>/<name>/SKILL.md", () => {
  const source = setupSourceDir();
  const target = setupEmptyTargetDir();
  try {
    const result = install({ source, target });
    assert.equal(result.installed.length, SKILL_NAMES.length);
    for (const name of SKILL_NAMES) {
      const dest = join(target, name, "SKILL.md");
      assert.equal(existsSync(dest), true, `expected ${dest} to exist`);
      const body = readFileSync(dest, "utf-8");
      assert.match(body, new RegExp(`^---\\nname: ${name}`));
    }
  } finally {
    rmSync(source, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
});

test("install is idempotent — running twice produces the same files", () => {
  const source = setupSourceDir();
  const target = setupEmptyTargetDir();
  try {
    install({ source, target });
    install({ source, target });
    const subdirs = readdirSync(target).sort();
    assert.deepEqual(subdirs, [...SKILL_NAMES].sort());
  } finally {
    rmSync(source, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
});

test("install overwrites stale content cleanly", () => {
  const source = setupSourceDir();
  const target = setupEmptyTargetDir();
  try {
    // Pre-populate one of the destinations with stale content.
    const stalePath = join(target, "regna-lookup", "SKILL.md");
    mkdirSync(join(target, "regna-lookup"), { recursive: true });
    writeFileSync(stalePath, "stale content");

    install({ source, target });

    const body = readFileSync(stalePath, "utf-8");
    assert.doesNotMatch(body, /stale content/);
    assert.match(body, /^---\nname: regna-lookup/);
  } finally {
    rmSync(source, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
});

test("install raises when a source skill file is missing", () => {
  const source = mkdtempSync(join(tmpdir(), "regna-skills-bad-src-"));
  // Source dir is empty — no skill .md files at all.
  const target = setupEmptyTargetDir();
  try {
    assert.throws(
      () => install({ source, target }),
      /Skill source missing/,
    );
  } finally {
    rmSync(source, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
});

test("defaultTarget honours CLAUDE_SKILLS_DIR override", () => {
  assert.equal(defaultTarget({ CLAUDE_SKILLS_DIR: "/custom/path" }), "/custom/path");
});

test("defaultTarget falls back to ~/.claude/skills when env unset", () => {
  const result = defaultTarget({});
  assert.match(result, /\.claude\/skills$/);
});
