/** @type {import('next').NextConfig} */
const nextConfig = {
  // ignore pg-native and cloudflare:sockets
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/
      })
    );

    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com"
      }
    ]
  }
};

export default nextConfig;
