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
        full_name: `ТОВ "ВД "ЄВРОПЕЙСЬКИЙ ВИБІР"`,
        short_name: "Выбор",
        type: 1,
        edrpou: "41361788",
        bank_account: "UA293348510000000002600436228",
        bank_name: `АТ "ПУМБ"`,
        mfo: "334851",
      },
      {
        full_name: "Зенит",
        short_name: "Зенит",
        type: 1,
        edrpou: "22345678",
        bank_account: "UA123456780000000000000002",
        bank_name: "ПриватБанк",
        mfo: "305299",
      },
      {
        full_name: "Аврора",
        short_name: "Аврора",
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
const partnerEntityLinks: { partner_id: number; entity_id: number }[] = [];
const allPartners: { id: number; edrpou: string }[] = [];

async function seedPartners() {
  const createPartners = async (
    entity_id: number,
    count: number,
    shortPrefix: string,
    fullPrefix: string,
    edrpouPrefix: string,
    type: number
  ) => {
    for (let i = 0; i < count; i++) {
      const edrpou = `${edrpouPrefix}${(i + 1).toString().padStart(2, "0")}`;
      const partner = await prisma.partners.create({
        data: {
          short_name: `${shortPrefix}${i + 1}`,
          full_name: `${fullPrefix} №${i + 1}`,
          type,
          edrpou,
          group: [],
        },
      });
      partnerEntityLinks.push({ partner_id: partner.id, entity_id });
      allPartners.push({ id: partner.id, edrpou });
    }
  };

  await createPartners(2, 4, "ЗенитПартнёр", 'ТОВ "Зенит Партнёр"', "100001", 2);
  await createPartners(1, 22, "ВыборПартнёр", 'ТОВ "Выбор Партнёр"', "100002", 1);
  await createPartners(3, 5, "АврораПартнёр", 'ТОВ "Аврора Партнёр"', "100003", 3);

  const realPartner = await prisma.partners.create({
    data: {
      short_name: "Фактор-Друк",
      full_name: 'ТОВ "Фактор-Друк"',
      type: 1,
      edrpou: "20030635",
      group: [],
    },
  });
  partnerEntityLinks.push({ partner_id: realPartner.id, entity_id: 1 });
  allPartners.push({ id: realPartner.id, edrpou: realPartner.edrpou });

  await prisma.partners_on_entities.createMany({
    data: partnerEntityLinks,
  });
}

async function seedPartnerAccounts() {
  const testAccounts = allPartners
    .filter(p => p.edrpou !== "20030635")
    .map((p, i) => ({
      partner_id: p.id,
      bank_account: `UA00000${i + 1}1234567890123456`,
      bank_name: `Bank ${i + 1}`,
      mfo: `3000${(i % 10) + 1}`,
    }));

  const real = allPartners.find(p => p.edrpou === "20030635");
  const realAccount = real
    ? {
        partner_id: real.id,
        bank_account: "UA933515330000026000052247108",
        bank_name: 'Харківське ГРУ АТ КБ "ПриватБанк"',
        mfo: "351533",
      }
    : null;

  await prisma.partner_account_number.createMany({
    data: realAccount ? [...testAccounts, realAccount] : testAccounts,
  });

  const accounts = await prisma.partner_account_number.findMany();
  await prisma.partner_account_numbers_on_entities.createMany({
    data: accounts.map(acc => ({
      entity_id:
        partnerEntityLinks.find(pl => pl.partner_id === acc.partner_id)?.entity_id ??
        1,
      partner_account_number_id: acc.id,
      is_visible: true,
      is_default: true,
    })),
  });
}

/* ───────── documents ───────── */
async function seedDocuments() {
  const allAccounts = await prisma.partner_account_number.findMany();
  const getAccountByPartnerId = (partner_id: number) =>
    allAccounts.find(acc => acc.partner_id === partner_id)?.id ?? 1;

  const documents = allPartners.map((p, i) => {
    const isAurora = p.edrpou.startsWith("100003");
    const isZenit = p.edrpou.startsWith("100001");
    const isVibor = p.edrpou.startsWith("100002");
    const isReal = p.edrpou === "20030635";

    const entity_id =
      isAurora ? 3 : isZenit ? 2 : isVibor || isReal ? 1 : 1;

    return {
      entity_id,
      partner_id: p.id,
      account_number: `Счет № ${i + 1}`,
      date: new Date(),
      account_sum: 1000 + i * 100,
      account_sum_expression: "",
      vat_type: true,
      vat_percent: 20,
      purpose_of_payment: "Оплата услуг",
      partner_account_number_id: getAccountByPartnerId(p.id),
      is_saved: true,
      is_paid: false,
      is_auto_purpose_of_payment: true,
      user_id: 1,
    };
  });

  await prisma.documents.createMany({ data: documents });
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
  const testuser = await prisma.user.findUnique({ where: { login: "testuser" } });
  if (!admin || !user || !testuser) return;

  await prisma.users_entities.create({
    data: { user_id: user.id, entity_id: 1 },
  });

  await prisma.users_partners.createMany({
    data: allPartners.slice(4, 7).map(p => ({
      user_id: user.id,
      partner_id: p.id,
      entity_id:
        partnerEntityLinks.find(l => l.partner_id === p.id)?.entity_id ?? 1,
    })),
  });

  await prisma.users_entities.createMany({
    data: [
      { user_id: testuser.id, entity_id: 1 },
      { user_id: testuser.id, entity_id: 2 },
    ],
  });

  await prisma.users_partners.createMany({
    data: allPartners.slice(7, 14).map(p => ({
      user_id: testuser.id,
      partner_id: p.id,
      entity_id:
        partnerEntityLinks.find(l => l.partner_id === p.id)?.entity_id ?? 1,
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
    await seedPartnerAccounts();
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
