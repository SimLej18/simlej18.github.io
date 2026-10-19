// Types and helpers only: importing software.json here would make the admin page reload on save

export const STATUSES = ["featured", "included", "unlisted"] as const;
export type Status = (typeof STATUSES)[number];

// Snapshot of the GitHub metadata, refreshed from the admin page
export interface GitHubInfo {
    url: string;
    description: string | null;
    language: string | null;
    topics: string[];
    stars: number;
    fork: boolean;
    archived: boolean;
}

// One public repo. Array order in software.json is the display order.
// name, description and tags override the GitHub values when set.
export interface SoftwareEntry {
    repo: string;  // "owner/name": repos of other owners can be added by hand
    status: Status;
    name?: string;
    description?: string;
    tags?: string[];
    github: GitHubInfo;
}

export interface Project {
    name: string;
    description: string;
    tags: string[];
    url: string;
    stars: number;
}

export function defaultTags(github: GitHubInfo): string[] {
    return [...(github.language ? [github.language] : []), ...github.topics];
}

export function shortName(repo: string): string {
    return repo.slice(repo.indexOf("/") + 1);
}

export function toProject(e: SoftwareEntry): Project {
    return {
        name: e.name ?? shortName(e.repo),
        description: e.description ?? e.github.description ?? "",
        tags: e.tags ?? defaultTags(e.github),
        url: e.github.url,
        stars: e.github.stars,
    };
}

export const GITHUB_USER = "SimLej18";

interface GitHubRepo {
    full_name: string;
    html_url: string;
    description: string | null;
    language: string | null;
    topics?: string[];
    stargazers_count: number;
    fork: boolean;
    archived: boolean;
}

function toInfo(r: GitHubRepo): GitHubInfo {
    return {
        url: r.html_url,
        description: r.description,
        language: r.language,
        topics: r.topics ?? [],
        stars: r.stargazers_count,
        fork: r.fork,
        archived: r.archived,
    };
}

// GitHub calls are made from the browser (the API allows CORS)

// Public repos owned by GITHUB_USER, by "owner/name"
export async function fetchGitHubRepos(): Promise<Map<string, GitHubInfo>> {
    const repos = new Map<string, GitHubInfo>();
    for (let page = 1; ; page++) {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?type=owner&per_page=100&page=${page}`);
        if (!res.ok) throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
        const batch: GitHubRepo[] = await res.json();
        for (const r of batch) repos.set(r.full_name, toInfo(r));
        if (batch.length < 100) return repos;
    }
}

// Any public repo by "owner/name", null if it does not exist
export async function fetchGitHubRepo(repo: string): Promise<GitHubInfo | null> {
    const res = await fetch(`https://api.github.com/repos/${repo}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
    return toInfo(await res.json());
}

export function isOwnRepo(repo: string): boolean {
    return repo.startsWith(`${GITHUB_USER}/`);
}
