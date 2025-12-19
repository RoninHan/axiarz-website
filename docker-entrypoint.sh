#!/bin/sh
set -e

echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Generating Prisma Client..."
node node_modules/prisma/build/index.js generate

echo "Initializing admin account..."
# 使用环境变量中的管理员信息（从 docker-compose.yml 传入）
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@axiarz.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123456';
    const name = process.env.ADMIN_NAME || 'Super Admin';
    
    console.log('Checking admin account:', email);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        status: 'active',
        name,
        role: 'super_admin'
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: 'super_admin',
        status: 'active'
      }
    });
    
    console.log('✓ Admin account ready:', admin.email);
  } catch (error) {
    console.error('⚠ Admin init error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
" || echo "⚠ Admin initialization skipped"

echo "Starting Next.js application..."
exec node server.js
