import type { NextConfig } from 'next';

const INTIMGRAM_URL = 'https://intimgram.com';

const catalogPaths = [
  'tbilisi', 'batumi', 'kutaisi', 'rustavi', 'telavi',
  'girls', 'boys', 'trans', 'escorts', 'independent', 'dominatrix',
  'saburtalo', 'vake', 'vera', 'mtatsminda', 'didube', 'isani', 'gldani',
];

const catalogRedirects = catalogPaths.map((p) => ({
  source: `/${p}`,
  destination: `${INTIMGRAM_URL}/${p}`,
  permanent: true,
}));

const appRedirects = [
  'profiles', 'agencies', 'favorites', 'registration',
  'add-profile', 'manage-profiles', 'superadmin', 'admin-blog', 'xgeorgia', 'kamage',
].map((p) => ({
  source: `/${p}/:path*`,
  destination: `${INTIMGRAM_URL}/`,
  permanent: true,
}));

const platformRedirects = [
  { source: '/about/', destination: '/aboutUs/', permanent: true },
].map((r) => ({ ...r, source: r.source, destination: r.destination }));

const nextConfig: NextConfig = {
  trailingSlash: true,
  redirects: async () => [...catalogRedirects, ...appRedirects, ...platformRedirects],
};

export default nextConfig;
