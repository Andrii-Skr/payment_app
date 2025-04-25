// seed.ts
import prisma from "./prisma-client";
import bcrypt from "bcrypt";

/* ───────── helpers ───────── */
function getRandomOffset() {
  return Math.floor(Math.random() * 5) + 1;
}
function getRandomDate() {
  const d = new Date();
  d.setDate(d.getDate() + getRandomOffset());
  return d;
}

/* ───────── clear DB ───────── */
async function clearData() {
  const tables = [
    "spec_doc",
    "documents",
    "partner_account_number",
    "partners",
    "users_partners",
    "users_entities",
    "user",
    "role",
    "entity",
    "template",
  ];
  for (const t of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`,
    );
  }
}

/* ───────── roles / entities / users ───────── */
async function seedRoles() {
  await prisma.role.createMany({ data: [{ name: "admin" }, { name: "user" }] });
}

async function seedEntities() {
  await prisma.entity.createMany({
    data: [
      {
        name: `ТОВ "ВД "ЄВРОПЕЙСЬКИЙ ВИБІР"`,
        type: 1,
        edrpou: "41361788",
        bank_account: "UA293348510000000002600436228",
        bank_name: `АТ "ПУМБ"`,
        mfo: "334851",
      },
      {
        name: "Зенит",
        type: 1,
        edrpou: "22345678",
        bank_account: "UA123456780000000000000002",
        bank_name: "ПриватБанк",
        mfo: "305299",
      },
      {
        name: "Аврора",
        type: 1,
        edrpou: "32345678",
        bank_account: "UA123456780000000000000003",
        bank_name: "ПУМБ",
        mfo: "334851",
      },
    ],
  });
}

async function seedUsers() {
  const users = [
    { login: "admin", password: "admin", role_id: 1, name: "admin" },
    { login: "user", password: "user", role_id: 2, name: "user" },
    { login: "testuser", password: "testuser", role_id: 2, name: "test user" },
  ];
  await Promise.all(
    users.map(async u => {
      const hashed = await bcrypt.hash(u.password, 10);
      await prisma.user.create({ data: { ...u, password: hashed } });
    }),
  );
}

/* ───────── partners & accounts ───────── */
async function seedPartners() {
  /* test-контрагенты */
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

  /* реальный контрагент */
  const viborPartnersReal = {
    id: 500,
    name: 'ТОВ "Фактор-Друк"',
    type: 1,
    edrpou: "20030635",
    entity_id: 1,
  };

  const allPartners = [
    ...zenitPartners,
    ...viborPartners,
    ...auroraPartners,
    viborPartnersReal,
  ];
  await prisma.partners.createMany({ data: allPartners });

  /* банковские счета */
  const testAccounts = allPartners
    //@ts-ignore
    .filter(p => p.id !== 500) // пропускаем «Фактор-Друк»
    .map((_, i) => ({
      partner_id: i + 1, // id 1-31
      bank_account: `UA00000${i + 1}1234567890123456`,
      bank_name: `Bank ${i + 1}`,
      mfo: `3000${(i % 10) + 1}`,
      is_default: true,
    }));

  const partnerAccountReal = {
    id: 500,
    partner_id: 500,
    bank_account: "UA933515330000026000052247108",
    bank_name: 'Харківське ГРУ АТ КБ "ПриватБанк"',
    mfo: "351533",
    is_default: true,
  };

  await prisma.partner_account_number.createMany({
    data: [...testAccounts, partnerAccountReal],
  });
}

/* ───────── documents ───────── */
async function seedDocuments() {
  const allAccounts = await prisma.partner_account_number.findMany();
  const getAccountByPartnerId = (partner_id: number) =>
    allAccounts.find(acc => acc.partner_id === partner_id)?.id ?? 1;

  const baseDocs = Array.from({ length: 31 }, (_, i) => {
    const partner_id = i + 1;
    return {
      entity_id: i < 4 ? 2 : 1,
      partner_id,
      account_number: `Счет № ${i + 1}`,
      date: new Date(),
      account_sum: 1000 + i * 100,
      account_sum_expression: "",
      vat_type: true,
      vat_percent: 20,
      purpose_of_payment: "Оплата услуг",
      partner_account_number_id: getAccountByPartnerId(partner_id),
      is_saved: true,
      is_paid: false,
      user_id: 1,
    };
  });

  const auroraDocs = Array.from({ length: 5 }, (_, i) => {
    const partner_id = 26 + i + 1;
    return {
      entity_id: 3,
      partner_id,
      account_number: `Счет Аврора № ${i + 1}`,
      date: new Date(),
      account_sum: 3000 + i * 200,
      account_sum_expression: "",
      vat_type: true,
      vat_percent: 20,
      purpose_of_payment: "Оплата по договору",
      partner_account_number_id: getAccountByPartnerId(partner_id),
      is_saved: true,
      is_paid: false,
      user_id: 1,
    };
  });

  /* документы для Фактор-Друк */
  const viborRealDocs = Array.from({ length: 5 }, (_, i) => ({
    entity_id: 1,
    partner_id: 500,
    account_number: `ФД-${i + 1}`,
    date: new Date(),
    account_sum: 5000 + i * 500,
    account_sum_expression: "",
    vat_type: true,
    vat_percent: 20,
    purpose_of_payment: "Оплата поліграфічних послуг",
    partner_account_number_id: getAccountByPartnerId(500),
    is_saved: true,
    is_paid: false,
    user_id: 1,
  }));

  await prisma.documents.createMany({
    data: [...baseDocs, ...auroraDocs, ...viborRealDocs],
  });
}

/* ───────── spec_doc ───────── */
async function seedSpecs() {
  const totalDocs = await prisma.documents.count();
  const specDocs = [];

  for (let docId = 1; docId <= totalDocs; docId++) {
    specDocs.push(
      {
        documents_id: docId,
        pay_sum: 1000 + docId * 10,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: docId,
        pay_sum: 800 + docId * 10,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
    );
  }
  await prisma.spec_doc.createMany({ data: specDocs });
}

/* ───────── user ↔ access ───────── */
async function seedUserAccess() {
  const admin = await prisma.user.findUnique({ where: { login: "admin" } });
  const user = await prisma.user.findUnique({ where: { login: "user" } });
  const testuser = await prisma.user.findUnique({
    where: { login: "testuser" },
  });
  if (!admin || !user || !testuser) return;

  await prisma.users_entities.create({
    data: { user_id: user.id, entity_id: 1 },
  });
  await prisma.users_partners.createMany({
    data: [5, 6, 7].map(id => ({ user_id: user.id, partner_id: id })),
  });

  await prisma.users_entities.createMany({
    data: [
      { user_id: testuser.id, entity_id: 1 },
      { user_id: testuser.id, entity_id: 2 },
    ],
  });
  await prisma.users_partners.createMany({
    data: [8, 9, 10, 1, 2, 3, 4].map(id => ({
      user_id: testuser.id,
      partner_id: id,
    })),
  });
}

/* ───────── main ───────── */
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
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
