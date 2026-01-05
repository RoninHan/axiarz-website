import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function createSuperAdmin() {
  try {
    const existing = await prisma.admin.findFirst({
      where: { role: 'super_admin' }
    });
    
    if (existing) {
      console.log('✅ 超级管理员已存在:', existing.email);
      return;
    }
    
    const password = await bcrypt.hash('admin123', 10);
    const superAdmin = await prisma.admin.create({
      data: {
        email: 'admin@axiarz.com',
        name: '超级管理员',
        password: password,
        role: 'super_admin',
        status: 'active'
      }
    });
    
    console.log('✅ 创建超级管理员成功!');
    console.log('邮箱:', superAdmin.email);
    console.log('密码: admin123');
  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
