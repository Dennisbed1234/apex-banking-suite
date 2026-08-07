import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@fictionalbank.demo";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.administrator.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Seeded administrator '${adminUsername}'. Change the password after first login.`);

  const demoUserEmail = "demo.customer@fictionalbank.demo";
  const demoUserHash = await bcrypt.hash("DemoPass123!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Customer",
      email: demoUserEmail,
      passwordHash: demoUserHash,
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  await prisma.checkingAccount.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      accountNumber: "1000200030",
      routingNumber: process.env.BANK_ROUTING_NUMBER || "000000000",
      balance: 2500.0,
      availableBalance: 2500.0,
    },
  });
  await prisma.savingsAccount.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      accountNumber: "2000300040",
      routingNumber: process.env.BANK_ROUTING_NUMBER || "000000000",
      balance: 10000.0,
      availableBalance: 10000.0,
    },
  });

  console.log(`Seeded demo customer '${demoUserEmail}' / password 'DemoPass123!'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
