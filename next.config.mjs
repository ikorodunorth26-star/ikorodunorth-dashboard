const apiProxyTarget = (
  process.env.API_PROXY_TARGET || "http://127.0.0.1:4000"
).replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${apiProxyTarget}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
