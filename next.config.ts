import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';
import { GITHUB_PAGES_BASE_PATH } from './lib/site';

const isGithubPages = process.env.GITHUB_PAGES === 'true';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || isGithubPages,
  register: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? GITHUB_PAGES_BASE_PATH : '',
  },
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: GITHUB_PAGES_BASE_PATH,
        trailingSlash: true,
      }
    : {}),
};

export default withPWA(nextConfig);
