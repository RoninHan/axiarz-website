# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package.json 和 lock 文件（如果存在）
COPY package.json yarn.lock* package-lock.json* ./

# 智能选择包管理器：
# - 如果存在 yarn.lock，启用 yarn（通过 corepack）并使用 yarn install
# - 如果存在 package-lock.json，使用 npm ci
# - 否则使用 npm install
RUN \
  if [ -f yarn.lock ]; then \
    corepack enable || true; \
    if ! command -v yarn >/dev/null 2>&1; then \
      npm install -g yarn --force; \
    fi && \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量（构建时）
ENV NEXT_TELEMETRY_DISABLED 1

# 生成 Prisma Client 并构建应用
RUN npx prisma generate
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 安装 Prisma CLI（用于运行时迁移）
RUN npm install -g prisma@5.10.2

# 复制必要的文件
# Next.js standalone 输出已经包含了必要的 node_modules，但需要额外复制 public 和 prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# 复制 Prisma schema 和 migrations（用于运行时迁移）
COPY --from=builder /app/prisma ./prisma
# 复制 Prisma Client（standalone 可能不包含）
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

