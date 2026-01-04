/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // 启用 standalone 输出以优化 Docker 镜像

  webpack: (config, { isServer }) => {
    // 排除 alipay-sdk 在客户端的打包
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // 完全排除 alipay-sdk
    config.externals = config.externals || []
    config.externals.push('alipay-sdk')

    return config
  },
}

module.exports = nextConfig

