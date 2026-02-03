import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update all users without usernames
  const users = await prisma.user.findMany({
    where: { username: null },
  });

  console.log(`Found ${users.length} users without usernames`);

  for (const user of users) {
    // Generate username from email (part before @)
    const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if username already exists and add number if needed
    let username = baseUsername;
    let counter = 1;

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });

    console.log(`Updated user ${user.email} with username: ${username}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
