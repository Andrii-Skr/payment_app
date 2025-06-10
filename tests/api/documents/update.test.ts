import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/documents/update/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    documents: { update: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
    $disconnect: jest.fn(),
  },
}));

jest.mock("@/lib/date/getSafeDateForPrisma", () => ({
  getSafeDateForPrisma: jest.fn(() => new Date()),
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

const { getSafeDateForPrisma } = require("@/lib/date/getSafeDateForPrisma");

describe("PATCH /documents/update", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 обновляет документ", async () => {
    prisma.documents.update.mockResolvedValueOnce({ id: 1 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ doc_id: 1, entity_id: 1, partner_id: 1, partner_account_number_id: 1, accountNumber: "a", date: "2020-01-01", accountSum: 1, accountSumExpression: "1", vatType: false, vatPercent: 0, purposeOfPayment: "", payments: [] }),
        });
        expect(res.status).toBe(200);
      },
    });
  });
});
