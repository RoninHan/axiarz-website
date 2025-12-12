/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // 启用 standalone 输出以优化 Docker 镜像
}

module.exports = nextConfig

