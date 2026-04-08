/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        zlib: false,
        os: false,
        module: false,
        assert: false,
        util: false,
        buffer: false,
        url: false,
        async_hooks: false,
        events: false,
        http: false,
        https: false,
        dns: false,
        dgram: false,
        net: false,
        readline: false,
        repl: false,
        timers: false,
        v8: false,
        vm: false,
        process: false,
        punycode: false,
        querystring: false,
        string_decoder: false,
        sys: false,
        perf_hooks: false,
        inspector: false,
        tty: false,
        constants: false,
      };

      // Exclude Prisma client from browser bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
      };
    }
    return config;
  },
  // Ignore TypeScript errors for now
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;