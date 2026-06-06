/** Must match the GitHub repository name for project Pages subpath deployment. */
export const GITHUB_PAGES_BASE_PATH = '/asthetic-habit-tracker';

export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? '';
}
