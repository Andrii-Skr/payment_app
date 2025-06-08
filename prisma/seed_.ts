import prisma from "./prisma-client";
import bcrypt from "bcrypt";

function getRandomOffset() {
  return Math.floor(Math.random() * 5) + 1;
}

function getRandomDate() {
  const d = new Date();
  d.setDate(d.getDate() + getRandomOffset());
  return d;
}

async function clearData() {
  const tables = [
    "spec_doc",
    "documents",
    "partner_account_number",
    "partners_on_entities",
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
      `TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`
    );
  }
}

async function seedRoles() {
  await prisma.role.createMany({ data: [{ name: "admin" }, { name: "user" }] });
}

async function seedEntities() {
  await prisma.entity.create({
    data: {
      full_name: `ТОВ "ВД "ЄВРОПЕЙСЬКИЙ ВИБІР"`,
      short_name: "Выбор",
      type: 1,
      edrpou: "41361788",
      bank_account: "UA293348510000000002600436228",
      bank_name: `АТ "ПУМБ"`,
      mfo: "334851",
    },
  });
}

async function seedUsers() {
  const adminPassword = await bcrypt.hash("admin", 10);
  const userPassword = await bcrypt.hash("user", 10);

  await prisma.user.createMany({
    data: [
      { login: "admin", password: adminPassword, role_id: 1, name: "admin" },
      { login: "user", password: userPassword, role_id: 2, name: "user" },
    ],
  });
}

async function seedRealPartner() {
  const partner = await prisma.partners.create({
    data: {
      short_name: "Фактор-Друк",
      full_name: 'ТОВ "Фактор-Друк"',
      type: 1,
      edrpou: "20030635",
      group: [],
    },
  });

  await prisma.partners_on_entities.create({
    data: {
      partner_id: partner.id,
      entity_id: 1,
    },
  });

  const account = await prisma.partner_account_number.create({
    data: {
      partner_id: partner.id,
      bank_account: "UA933515330000026000052247108",
      bank_name: 'Харківське ГРУ АТ КБ "ПриватБанк"',
      mfo: "351533",
    },
  });

  await prisma.partner_account_numbers_on_entities.create({
    data: {
      entity_id: 1,
      partner_account_number_id: account.id,
      is_visible: true,
      is_default: true,
    },
  });

  return partner.id;
}

async function seedDocument(partner_id: number) {
  const acc = await prisma.partner_account_number.findFirst({
    where: { partner_id },
  });

  if (!acc) throw new Error("No account for partner");

  const doc = await prisma.documents.create({
    data: {
      entity_id: 1,
      partner_id,
      account_number: "qw32",
      date: new Date(),
      account_sum: 1120,
      account_sum_expression: "",
      vat_type: true,
      vat_percent: 20,
      purpose_of_payment:
        "Оплата услуг № qw32 від 19.05.2025, у т.ч. ПДВ 20% = 186,67 грн.",
      partner_account_number_id: acc.id,
      is_saved: true,
      is_paid: false,
      user_id: 1,
    },
  });

  await prisma.spec_doc.createMany({
    data: [
      {
        documents_id: doc.id,
        pay_sum: 1120,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: doc.id,
        pay_sum: 800,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
    ],
  });
}

async function seedUserAccess(partner_id: number) {
  const user = await prisma.user.findUnique({ where: { login: "user" } });

  if (!user) return;

  await prisma.users_entities.create({
    data: { user_id: user.id, entity_id: 1 },
  });

  await prisma.users_partners.create({
    data: { user_id: user.id, partner_id },
  });
}

async function main() {
  try {
    await clearData();
    await seedRoles();
    await seedEntities();
    await seedUsers();
    const partnerId = await seedRealPartner();
    await seedDocument(partnerId);
    await seedUserAccess(partnerId);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
