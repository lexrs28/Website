import fs from "node:fs/promises";
import path from "node:path";
import { getPublicationItem } from "@/lib/content-intake/content-read";
import {
  buildPullRequestBody,
  buildPullRequestTitle,
  createGitHubService,
  parseGitHubRepoRef
} from "@/lib/content-intake/github";
import {
  aboutRelativePath,
  blogRelativePathForSlug,
  findBlogFileBySlug,
  findPublicationFileBySlug,
  pathExists,
  projectsRelativePath,
  publicationDocxAssetRelativePath,
  publicationPdfAssetRelativePath,
  publicationRelativePathForSlug
} from "@/lib/content-intake/paths";
import {
  serializeAboutMdx,
  serializeBlogMdx,
  serializeProjectsMdx,
  serializePublicationMdx
} from "@/lib/content-intake/serialize";
import {
  assertEditSlugUnchanged,
  validateUploadFile,
  type PublicationSubmission,
  type ValidatedSubmission
} from "@/lib/content-intake/validate";
import {
  addAndCommit,
  buildBranchName,
  buildCommitMessage,
  createContentWorktree,
  getRemoteOriginUrl,
  pushBranch
} from "@/lib/content-intake/worktree";

export type SubmissionResult = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  branchName: string;
};

type EditSubmission = Extract<ValidatedSubmission, { mode: "edit" }>;
type CreateSubmission = Extract<ValidatedSubmission, { mode: "create" }>;

function submissionSlug(submission: ValidatedSubmission): string {
  switch (submission.type) {
    case "blog":
      return submission.data.slug;
    case "publication":
      return submission.data.slug;
    case "about":
      return "about";
    case "projects":
      return "projects";
    default: {
      const exhaustiveCheck: never = submission;
      throw new Error(`Unsupported submission type: ${String(exhaustiveCheck)}`);
    }
  }
}

async function ensureFileTargetExistsForEdit(repoRoot: string, submission: EditSubmission): Promise<string> {
  if (submission.type === "blog") {
    const existing = await findBlogFileBySlug(repoRoot, submission.id);
    if (!existing) {
      throw new Error(`Blog post with slug '${submission.id}' was not found`);
    }

    return existing.relativePath;
  }

  if (submission.type === "publication") {
    const existing = await findPublicationFileBySlug(repoRoot, submission.id);
    if (!existing) {
      throw new Error(`Publication with slug '${submission.id}' was not found`);
    }

    return existing.relativePath;
  }

  if (submission.type === "about") {
    const aboutPath = aboutRelativePath();
    const exists = await pathExists(repoRoot, aboutPath);
    if (!exists) {
      throw new Error("About content file does not exist yet; use create mode");
    }

    return aboutPath;
  }

  const projectsPath = projectsRelativePath();
  const exists = await pathExists(repoRoot, projectsPath);
  if (!exists) {
    throw new Error("Projects content file does not exist yet; use create mode");
  }

  return projectsPath;
}

async function ensureNoCreateConflict(repoRoot: string, submission: CreateSubmission): Promise<void> {
  if (submission.type === "blog") {
    const existing = await findBlogFileBySlug(repoRoot, submission.data.slug);
    if (existing) {
      throw new Error(`A blog post with slug '${submission.data.slug}' already exists`);
    }

    return;
  }

  if (submission.type === "publication") {
    const existing = await findPublicationFileBySlug(repoRoot, submission.data.slug);
    if (existing) {
      throw new Error(`A publication with slug '${submission.data.slug}' already exists`);
    }

    return;
  }

  if (submission.type === "about") {
    const exists = await pathExists(repoRoot, aboutRelativePath());
    if (exists) {
      throw new Error("About content file already exists; use edit mode");
    }

    return;
  }

  const exists = await pathExists(repoRoot, projectsRelativePath());
  if (exists) {
    throw new Error("Projects content file already exists; use edit mode");
  }
}

async function writeTextFile(repoRoot: string, relativePath: string, content: string): Promise<void> {
  const absolutePath = path.join(repoRoot, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");
}

async function writeBinaryFile(repoRoot: string, relativePath: string, file: File): Promise<void> {
  const absolutePath = path.join(repoRoot, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);
}

function mergePublicationLinks(input: {
  submission: PublicationSubmission;
  existingLinks?: {
    doi?: string;
    arxiv?: string;
    pdf?: string;
    docx?: string;
    code?: string;
  };
  uploadedPdf: boolean;
  uploadedDocx: boolean;
}): PublicationSubmission["data"]["links"] {
  const current = input.submission.data.links;
  const existing = input.existingLinks;

  return {
    doi: current.doi ?? existing?.doi,
    arxiv: current.arxiv ?? existing?.arxiv,
    code: current.code ?? existing?.code,
    pdf: input.uploadedPdf ? `/publications/${input.submission.data.slug}.pdf` : current.pdf ?? existing?.pdf,
    docx: input.uploadedDocx ? `/publications/${input.submission.data.slug}.docx` : current.docx ?? existing?.docx
  };
}

function selectContentPathForCreate(submission: CreateSubmission): string {
  switch (submission.type) {
    case "blog":
      return blogRelativePathForSlug(submission.data.slug);
    case "publication":
      return publicationRelativePathForSlug(submission.data.slug);
    case "about":
      return aboutRelativePath();
    case "projects":
      return projectsRelativePath();
    default: {
      const exhaustiveCheck: never = submission;
      throw new Error(`Unsupported submission type: ${String(exhaustiveCheck)}`);
    }
  }
}

export async function submitLocalContent(options: {
  repoRoot: string;
  submission: ValidatedSubmission;
  pdfFile?: File;
  docxFile?: File;
}): Promise<SubmissionResult> {
  const baseBranch = process.env.CONTENT_PIPELINE_BASE_BRANCH?.trim() || "main";

  assertEditSlugUnchanged(options.submission);

  if (options.pdfFile) {
    validateUploadFile(options.pdfFile, "pdf");
  }

  if (options.docxFile) {
    validateUploadFile(options.docxFile, "docx");
  }

  const slug = submissionSlug(options.submission);
  const branchName = buildBranchName({
    type: options.submission.type,
    slug
  });

  const worktree = await createContentWorktree({
    repoRoot: options.repoRoot,
    baseBranch,
    branchName
  });

  const changedFiles: string[] = [];

  try {
    let relativeContentPath: string;

    if (options.submission.mode === "create") {
      await ensureNoCreateConflict(options.repoRoot, options.submission);
      relativeContentPath = selectContentPathForCreate(options.submission);
    } else {
      relativeContentPath = await ensureFileTargetExistsForEdit(options.repoRoot, options.submission);
    }

    if (options.submission.type === "blog") {
      await writeTextFile(worktree.worktreePath, relativeContentPath, serializeBlogMdx(options.submission.data));
    }

    if (options.submission.type === "publication") {
      const existing =
        options.submission.mode === "edit"
          ? await getPublicationItem(options.repoRoot, options.submission.id)
          : null;

      if (options.submission.mode === "edit" && !existing) {
        throw new Error(`Publication with slug '${options.submission.id}' was not found`);
      }

      const mergedLinks = mergePublicationLinks({
        submission: options.submission,
        existingLinks: existing?.data.links,
        uploadedPdf: Boolean(options.pdfFile),
        uploadedDocx: Boolean(options.docxFile)
      });

      const mergedSubmission: PublicationSubmission = {
        ...options.submission,
        data: {
          ...options.submission.data,
          links: mergedLinks
        }
      };

      await writeTextFile(worktree.worktreePath, relativeContentPath, serializePublicationMdx(mergedSubmission.data));

      if (options.pdfFile) {
        const pdfPath = publicationPdfAssetRelativePath(options.submission.data.slug);
        await writeBinaryFile(worktree.worktreePath, pdfPath, options.pdfFile);
        changedFiles.push(pdfPath);
      }

      if (options.docxFile) {
        const docxPath = publicationDocxAssetRelativePath(options.submission.data.slug);
        await writeBinaryFile(worktree.worktreePath, docxPath, options.docxFile);
        changedFiles.push(docxPath);
      }
    }

    if (options.submission.type === "about") {
      await writeTextFile(worktree.worktreePath, relativeContentPath, serializeAboutMdx(options.submission.data));
    }

    if (options.submission.type === "projects") {
      await writeTextFile(worktree.worktreePath, relativeContentPath, serializeProjectsMdx(options.submission.data));
    }

    changedFiles.push(relativeContentPath);

    await addAndCommit({
      worktreePath: worktree.worktreePath,
      files: Array.from(new Set(changedFiles)),
      message: buildCommitMessage({
        type: options.submission.type,
        mode: options.submission.mode,
        slug
      })
    });

    await pushBranch(worktree.worktreePath, branchName);

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN is required for pull request creation");
    }

    const remoteUrl = await getRemoteOriginUrl(options.repoRoot);
    const repoRef = parseGitHubRepoRef(remoteUrl);

    const github = createGitHubService({
      token,
      repo: repoRef
    });

    const pullRequest = await github.createPullRequest({
      title: buildPullRequestTitle({
        type: options.submission.type,
        mode: options.submission.mode,
        slug
      }),
      body: buildPullRequestBody({
        type: options.submission.type,
        mode: options.submission.mode,
        slug,
        autoMerge: options.submission.autoMerge
      }),
      head: branchName,
      base: baseBranch
    });

    if (options.submission.autoMerge) {
      await github.enableAutoMerge({
        pullRequestNodeId: pullRequest.nodeId,
        mergeMethod: "SQUASH"
      });
    }

    return {
      pullRequestUrl: pullRequest.htmlUrl,
      pullRequestNumber: pullRequest.number,
      branchName
    };
  } finally {
    await worktree.cleanup();
  }
}
