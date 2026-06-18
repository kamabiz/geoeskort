import type { NextConfig } from 'next';

const catalogPaths = [
  'tbilisi', 'batumi', 'kutaisi', 'rustavi', 'telavi',
  'girls', 'boys', 'trans', 'escorts', 'independent', 'dominatrix',
  'saburtalo', 'vake', 'vera', 'mtatsminda', 'didube', 'isani', 'gldani',
];

const catalogRedirects = catalogPaths.map((p) => ({
  source: `/${p}`,
  destination: `https://kama.biz/${p}`,
  permanent: true,
}));

const appRedirects = [
  'profiles', 'agencies', 'favorites', 'registration',
  'add-profile', 'manage-profiles', 'superadmin', 'admin-blog', 'xgeorgia', 'kamage',
].map((p) => ({
  source: `/${p}/:path*`,
  destination: 'https://kama.biz/',
  permanent: true,
}));

const nextConfig: NextConfig = {
  trailingSlash: true,
  redirects: async () => [...catalogRedirects, ...appRedirects],
};

export default nextConfig;
