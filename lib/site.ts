/** GitHub repo: Joel-hanson/habit-tracker — subpath must match the repository name for Pages deployment. */
export const GITHUB_PAGES_BASE_PATH = '/habit-tracker';

export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? '';
}
