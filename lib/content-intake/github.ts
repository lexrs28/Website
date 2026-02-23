export type GitHubRepoRef = {
  owner: string;
  repo: string;
};

export type CreatedPullRequest = {
  number: number;
  htmlUrl: string;
  nodeId: string;
};

type PullRequestResponse = {
  number: number;
  html_url: string;
  node_id: string;
};

type FetchLike = typeof fetch;

function getErrorTextPrefix(response: Response): string {
  return `GitHub API request failed with status ${response.status}`;
}

async function parseErrorResponse(response: Response): Promise<never> {
  let detail = "";

  try {
    const body = (await response.json()) as { message?: string };
    detail = body.message ? `: ${body.message}` : "";
  } catch {
    detail = "";
  }

  throw new Error(`${getErrorTextPrefix(response)}${detail}`);
}

export function parseGitHubRepoRef(remoteUrl: string): GitHubRepoRef {
  const trimmed = remoteUrl.trim();

  if (trimmed.startsWith("git@")) {
    const match = trimmed.match(/^git@[^:]+:([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2]
      };
    }
  }

  try {
    const normalized = trimmed.replace(/^git\+/, "");
    const parsed = new URL(normalized);
    const parts = parsed.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/").filter(Boolean);
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1]
      };
    }
  } catch {
    // continue to explicit error below
  }

  throw new Error("Unable to parse GitHub repository owner/name from origin URL");
}

export function createGitHubService(options: {
  token: string;
  repo: GitHubRepoRef;
  fetchImpl?: FetchLike;
}): {
  createPullRequest: (input: {
    title: string;
    body: string;
    head: string;
    base: string;
  }) => Promise<CreatedPullRequest>;
  enableAutoMerge: (input: {
    pullRequestNodeId: string;
    mergeMethod: "SQUASH" | "MERGE" | "REBASE";
  }) => Promise<void>;
} {
  const fetchImpl = options.fetchImpl ?? fetch;

  async function createPullRequest(input: {
    title: string;
    body: string;
    head: string;
    base: string;
  }): Promise<CreatedPullRequest> {
    const response = await fetchImpl(
      `https://api.github.com/repos/${options.repo.owner}/${options.repo.repo}/pulls`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${options.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: input.title,
          body: input.body,
          head: input.head,
          base: input.base
        })
      }
    );

    if (!response.ok) {
      await parseErrorResponse(response);
    }

    const payload = (await response.json()) as PullRequestResponse;
    return {
      number: payload.number,
      htmlUrl: payload.html_url,
      nodeId: payload.node_id
    };
  }

  async function enableAutoMerge(input: {
    pullRequestNodeId: string;
    mergeMethod: "SQUASH" | "MERGE" | "REBASE";
  }): Promise<void> {
    const response = await fetchImpl("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${options.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          mutation EnableAutoMerge($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
            enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId, mergeMethod: $mergeMethod }) {
              pullRequest {
                number
              }
            }
          }
        `,
        variables: {
          pullRequestId: input.pullRequestNodeId,
          mergeMethod: input.mergeMethod
        }
      })
    });

    if (!response.ok) {
      await parseErrorResponse(response);
    }

    const payload = (await response.json()) as {
      errors?: Array<{ message?: string }>;
    };

    if (payload.errors && payload.errors.length > 0) {
      throw new Error(payload.errors[0]?.message ?? "GitHub GraphQL auto-merge mutation failed");
    }
  }

  return {
    createPullRequest,
    enableAutoMerge
  };
}

export function buildPullRequestTitle(options: {
  type: string;
  mode: "create" | "edit";
  slug: string;
}): string {
  return `content(${options.type}): ${options.mode} ${options.slug}`;
}

export function buildPullRequestBody(options: {
  type: string;
  mode: "create" | "edit";
  slug: string;
  autoMerge: boolean;
}): string {
  return [
    "## Local Content Intake",
    "",
    `- Type: ${options.type}`,
    `- Mode: ${options.mode}`,
    `- Slug: ${options.slug}`,
    `- Auto-merge requested: ${options.autoMerge ? "yes" : "no"}`
  ].join("\n");
}
