// seed.ts
import prisma from "./prisma-client";
import bcrypt from "bcrypt";

function getRandomOffset() {
  return Math.floor(Math.random() * 5) + 1;
}

function getRandomDate() {
  const date = new Date();
  date.setDate(date.getDate() + getRandomOffset());
  return date;
}

async function clearData() {
  const tables = [
    "spec_doc", "documents", "partner_account_number",
    "partners", "users_partners", "users_entities",
    "user", "role", "entity"
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
  }
}

async function seedRoles() {
  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "user" },
    ],
  });
}

async function seedEntities() {
  await prisma.entity.createMany({
    data: [
      { name: "Выбор", type: 1, edrpou: "12345678" },
      { name: "Зенит", type: 1, edrpou: "22345678" },
      { name: "Аврора", type: 1, edrpou: "32345678" },
    ],
  });
}

async function seedUsers() {
  const users = [
    { login: "admin", password: "admin", role_id: 1, name: "admin" },
    { login: "user", password: "user", role_id: 2, name: "user" },
    { login: "testuser", password: "testuser", role_id: 2, name: "test user" },
  ];

  await Promise.all(users.map(async (user) => {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: { ...user, password: hashed },
    });
  }));
}

async function seedUserAccess() {
  const admin = await prisma.user.findUnique({ where: { login: "admin" } });
  const user = await prisma.user.findUnique({ where: { login: "user" } });
  const testuser = await prisma.user.findUnique({ where: { login: "testuser" } });

  if (!admin || !user || !testuser) return;

  // user -> Выбор (entity 1)
  await prisma.users_entities.create({ data: { user_id: user.id, entity_id: 1 } });
  const userPartners = [5, 6, 7].map((id) => ({ user_id: user.id, partner_id: id }));
  await prisma.users_partners.createMany({ data: userPartners });

  // testuser -> Выбор + Зенит
  await prisma.users_entities.createMany({
    data: [
      { user_id: testuser.id, entity_id: 1 },
      { user_id: testuser.id, entity_id: 2 },
    ],
  });

  const testuserPartners = [8, 9, 10, 1, 2, 3, 4].map((id) => ({
    user_id: testuser.id,
    partner_id: id,
  }));

  await prisma.users_partners.createMany({ data: testuserPartners });
}

async function seedPartners() {
  const zenitPartners = Array.from({ length: 4 }, (_, i) => ({
    name: `partner${i + 1}Зенит`,
    type: 2,
    edrpou: `100001${(i + 1).toString().padStart(2, "0")}`,
    entity_id: 2,
  }));

  const viborPartners = Array.from({ length: 22 }, (_, i) => ({
    name: `partner${i + 1}Выбор`,
    type: 1,
    edrpou: `100002${(i + 1).toString().padStart(2, "0")}`,
    entity_id: 1,
  }));

  const auroraPartners = Array.from({ length: 5 }, (_, i) => ({
    name: `partner${i + 1}Аврора`,
    type: 3,
    edrpou: `100003${(i + 1).toString().padStart(2, "0")}`,
    entity_id: 3,
  }));

  const allPartners = [...zenitPartners, ...viborPartners, ...auroraPartners];
  await prisma.partners.createMany({ data: allPartners });

  const bankAccounts = allPartners.map((_, i) => ({
    partner_id: i + 1,
    bank_account: `IBAN ${i + 1} 12345678901234567890`,
    mfo: "3234",
  }));

  await prisma.partner_account_number.createMany({ data: bankAccounts });
}

async function seedSpecs() {
  const specDocs = [];
  for (let i = 1; i <= 36; i++) {
    specDocs.push(
      { documents_id: i, pay_sum: 1000 + i * 10, expected_date: getRandomDate(), dead_line_date: getRandomDate() },
      { documents_id: i, pay_sum: 800 + i * 10, expected_date: null, dead_line_date: getRandomDate() },
    );
  }
  await prisma.spec_doc.createMany({ data: specDocs });
}

async function seedDocuments() {
  const baseDocs = Array.from({ length: 31 }, (_, i) => ({
    entity_id: i < 4 ? 2 : 1,
    partner_id: i + 1,
    account_number: `Счет № ${i + 1}`,
    date: new Date(),
    account_sum: 1000 + i * 100,
    account_sum_expression: "",
    purpose_of_payment: "Оплата услуг",
    bank_account: `IBAN ${i + 1} 12345678901234567890`,
    mfo: "1234",
    is_saved: true,
    is_paid: false,
    user_id: 1,
  }));

  const auroraDocs = Array.from({ length: 5 }, (_, i) => ({
    entity_id: 3,
    partner_id: 26 + i + 1,
    account_number: `Счет Аврора № ${i + 1}`,
    date: new Date(),
    account_sum: 3000 + i * 200,
    account_sum_expression: "",
    purpose_of_payment: "Оплата по договору",
    bank_account: `IBAN ${26 + i + 1} 12345678901234567890`,
    mfo: "3234",
    is_saved: true,
    is_paid: false,
    user_id: 1,
  }));

  const allDocs = [...baseDocs, ...auroraDocs];
  await prisma.documents.createMany({ data: allDocs });
}

async function main() {
  try {
    await clearData();
    await seedRoles();
    await seedEntities();
    await seedUsers();
    await seedPartners();
    await seedDocuments();
    await seedSpecs();
    await seedUserAccess();
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
