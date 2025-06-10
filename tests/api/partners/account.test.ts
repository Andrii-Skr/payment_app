import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/partners/account/route";
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
  getServerSession: jest.fn(() =>
    Promise.resolve({ user: { id: 1, role: Roles.ADMIN } })
  ),
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
        const res = await fetch({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ partner_id: 1, entity_id: 1, bank_account: "12345678901234567890123456789", mfo: "1" }) });
        expect(res.status).toBe(200);
      },
    });
  });
});
