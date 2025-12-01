import * as handler from "@api/partners/account/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    partner_account_number: { findFirst: jest.fn(), create: jest.fn() },
    partner_account_numbers_on_entities: { create: jest.fn(), updateMany: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
    $transaction: jest.fn(() => Promise.resolve()),
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
  beforeEach(() => jest.clearAllMocks());

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
            bank_account: "12345678901234567890123456789",
            mfo: "1",
          }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 создаёт счёт", async () => {
    prisma.partner_account_number.create.mockResolvedValueOnce({ id: 1 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 1,
            bank_account: "12345678901234567890123456789",
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

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 2,
            bank_account: "12345678901234567890123456789",
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

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partner_id: 1,
            entity_id: 2,
            bank_account: "12345678901234567890123456789",
          }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.message).toBe("Счёт уже существует у партнёра.");
      },
    });
  });
});
