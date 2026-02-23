import { describe, expect, it, vi } from "vitest";
import { createGitHubService, parseGitHubRepoRef } from "@/lib/content-intake/github";

describe("github service", () => {
  it("parses ssh and https origin urls", () => {
    expect(parseGitHubRepoRef("git@github.com:lexrs28/Website.git")).toEqual({
      owner: "lexrs28",
      repo: "Website"
    });

    expect(parseGitHubRepoRef("https://github.com/lexrs28/Website.git")).toEqual({
      owner: "lexrs28",
      repo: "Website"
    });
  });

  it("creates a pull request and enables auto-merge", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/pulls")) {
        return new Response(
          JSON.stringify({
            number: 17,
            html_url: "https://github.com/lexrs28/Website/pull/17",
            node_id: "PR_node_id"
          }),
          { status: 201 }
        );
      }

      if (url.endsWith("/graphql")) {
        return new Response(
          JSON.stringify({
            data: {
              enablePullRequestAutoMerge: {
                pullRequest: {
                  number: 17
                }
              }
            }
          }),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ message: "unexpected endpoint" }), { status: 500 });
    });

    const github = createGitHubService({
      token: "test-token",
      repo: {
        owner: "lexrs28",
        repo: "Website"
      },
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    const pullRequest = await github.createPullRequest({
      title: "content(blog): create hello-world",
      body: "content body",
      head: "content/blog/hello-world-20260216-120000",
      base: "main"
    });

    await github.enableAutoMerge({
      pullRequestNodeId: pullRequest.nodeId,
      mergeMethod: "SQUASH"
    });

    expect(pullRequest.number).toBe(17);
    expect(pullRequest.htmlUrl).toContain("/pull/17");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const graphqlCall = fetchMock.mock.calls[1];
    expect(String(graphqlCall?.[0])).toContain("/graphql");

    const graphqlBody = JSON.parse(String(graphqlCall?.[1]?.body));
    expect(graphqlBody.variables.mergeMethod).toBe("SQUASH");
    expect(graphqlBody.variables.pullRequestId).toBe("PR_node_id");
  });
});
