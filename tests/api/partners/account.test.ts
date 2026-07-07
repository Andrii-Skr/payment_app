import * as handler from "@api/partners/account/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    partners_on_entities: { findMany: jest.fn() },
    partner_account_numbers_on_entities: { create: jest.fn(), updateMany: jest.fn() },
    user: { findUnique: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
    $transaction: jest.fn(() => Promise.resolve()),
    partner_account_number: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })),
}));

jest.mock("@/lib/authOptions", () => ({ authOptions: {} }));
jest.mock("@/lib/logs/logApiRequest", () => ({ logApiRequest: jest.fn() }));

const prisma = require("@/prisma/prisma-client").default;
const { getServerSession } = require("next-auth");

describe("POST /partners/account", () => {
  afterAll(async () => prisma.$disconnect?.());
  const bankAccount = "UA123456789012345678901234567";

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.partners_on_entities.findMany.mockResolvedValue([{ entity_id: 1 }]);
    prisma.partner_account_number.findUniqueOrThrow.mockResolvedValue({
      id: 1,
      bank_account: bankAccount,
      entities: [{ entity_id: 1, is_default: false, is_visible: true, is_deleted: false }],
    });
  });

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 1,
            bank_account: bankAccount,
            mfo: "1",
          }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 создаёт счёт", async () => {
    prisma.partner_account_number.create.mockResolvedValueOnce({ id: 1 });
    prisma.$transaction.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<void>) => cb(prisma));

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 1,
            bank_account: bankAccount,
            mfo: "1",
          }),
        });
        expect(res.status).toBe(200);
      },
    });
  });

  it("200 привязывает существующий счёт без сообщения", async () => {
    prisma.partner_account_number.findFirst.mockResolvedValueOnce({
      id: 2,
      entities: [],
    });
    prisma.partner_account_number.findUniqueOrThrow.mockResolvedValueOnce({
      id: 2,
      bank_account: bankAccount,
      entities: [{ entity_id: 2, is_default: false, is_visible: true, is_deleted: false }],
    });
    prisma.partners_on_entities.findMany.mockResolvedValueOnce([{ entity_id: 2 }]);
    prisma.$transaction.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<void>) => cb(prisma));

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 2,
            bank_account: bankAccount,
          }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.message).toBeUndefined();
      },
    });
  });

  it("200 возвращает сообщение если счёт уже привязан", async () => {
    prisma.partner_account_number.findFirst.mockResolvedValueOnce({
      id: 3,
      entities: [{ entity_id: 2 }],
    });
    prisma.partner_account_number.findUniqueOrThrow.mockResolvedValueOnce({
      id: 3,
      bank_account: bankAccount,
      entities: [{ entity_id: 2, is_default: false, is_visible: true, is_deleted: false }],
    });
    prisma.partners_on_entities.findMany.mockResolvedValueOnce([{ entity_id: 2 }]);
    prisma.$transaction.mockImplementationOnce(async (cb: (tx: typeof prisma) => Promise<void>) => cb(prisma));

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 2,
            bank_account: bankAccount,
          }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.message).toBe("Счёт уже был привязан к части юрлиц.");
      },
    });
  });

  it("403 для manager при попытке привязать счёт к недоступному дополнительному юрлицу", async () => {
    getServerSession.mockResolvedValueOnce({ user: { id: 7, role: Roles.MANAGER } });
    prisma.user.findUnique.mockResolvedValueOnce({
      users_entities: [{ entity_id: 1 }],
      users_partners: [{ entity_id: 1 }],
    });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 1,
            additional_entity_ids: [2],
            bank_account: bankAccount,
          }),
        });

        expect(res.status).toBe(403);
      },
    });
  });
});
