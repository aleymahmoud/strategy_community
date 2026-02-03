import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@strategycommunity.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);
  console.log('Username: admin');
  console.log('Default password: admin123');
  console.log('⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
