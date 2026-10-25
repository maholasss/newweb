/** @type {import('next').NextConfig} */

// La app privada Luna vivió en /sfkdd2r9j7 hasta el 25-oct-2026; ahora está en Di Capitan Apps.
const LUNA = 'https://dicapitanapp.pages.dev/lunamonth/';

const nextConfig = {
  async redirects() {
    return [
      { source: '/sfkdd2r9j7', destination: LUNA, permanent: true },
      { source: '/sfkdd2r9j7/:path*', destination: LUNA, permanent: true },
    ];
  },
};

export default nextConfig;
