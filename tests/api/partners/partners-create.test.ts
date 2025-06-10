import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/partners/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    partners: { findUnique: jest.fn(), create: jest.fn() },
    partners_on_entities: { create: jest.fn() },
    partner_account_number: { create: jest.fn() },
    partner_account_numbers_on_entities: { create: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
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

describe("POST /partners", () => {
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
            full_name: "F",
            short_name: "S",
            edrpou: "1",
            entity_id: 1,
            bank_account: "1",
            mfo: "1",
            bank_name: "b",
          }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("201 создаёт партнёра", async () => {
    prisma.partners.create.mockResolvedValueOnce({ id: 1, partner_account_number: [{ id: 1 }] , entities: [] });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ full_name: "F", short_name: "S", edrpou: "1", entity_id: 1, bank_account: "1", mfo: "1", bank_name: "b" }) });
        expect(res.status).toBe(201);
      },
    });
  });
});
