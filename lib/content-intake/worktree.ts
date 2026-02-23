import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type WorktreeHandle = {
  branchName: string;
  worktreePath: string;
  cleanup: () => Promise<void>;
};

async function runGit(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trim();
}

export async function getRemoteOriginUrl(repoRoot: string): Promise<string> {
  return runGit(repoRoot, ["remote", "get-url", "origin"]);
}

export async function createContentWorktree(options: {
  repoRoot: string;
  baseBranch: string;
  branchName: string;
}): Promise<WorktreeHandle> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "content-intake-"));

  try {
    await runGit(options.repoRoot, [
      "worktree",
      "add",
      "-b",
      options.branchName,
      tempRoot,
      options.baseBranch
    ]);
  } catch (error) {
    await fs.rm(tempRoot, { recursive: true, force: true });
    throw error;
  }

  return {
    branchName: options.branchName,
    worktreePath: tempRoot,
    cleanup: async () => {
      try {
        await runGit(options.repoRoot, ["worktree", "remove", "--force", tempRoot]);
      } finally {
        await fs.rm(tempRoot, { recursive: true, force: true });
      }
    }
  };
}

export async function addAndCommit(options: {
  worktreePath: string;
  files: string[];
  message: string;
}): Promise<void> {
  if (options.files.length === 0) {
    throw new Error("No files were provided for commit");
  }

  await runGit(options.worktreePath, ["add", ...options.files]);

  let hasStagedChanges = true;
  try {
    await runGit(options.worktreePath, ["diff", "--cached", "--quiet"]);
    hasStagedChanges = false;
  } catch {
    hasStagedChanges = true;
  }

  if (!hasStagedChanges) {
    throw new Error("No changes detected after staging files");
  }

  await runGit(options.worktreePath, ["commit", "-m", options.message]);
}

export async function pushBranch(worktreePath: string, branchName: string): Promise<void> {
  await runGit(worktreePath, ["push", "-u", "origin", branchName]);
}

export function buildBranchName(options: { type: string; slug: string; now?: Date }): string {
  const now = options.now ?? new Date();
  const timestamp = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("") +
    "-" +
    [
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0")
    ].join("");

  return `content/${options.type}/${options.slug}-${timestamp}`;
}

export function buildCommitMessage(options: {
  type: string;
  mode: "create" | "edit";
  slug: string;
}): string {
  return `content(${options.type}): ${options.mode} ${options.slug}`;
}
