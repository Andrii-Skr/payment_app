import * as handler from "@api/regular-payments/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    auto_payment: { findMany: jest.fn(), update: jest.fn() },
    documents: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    api_request_log: { create: jest.fn().mockResolvedValue(null) },
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

describe("PATCH /regular-payments", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ doc_id: 1 }),
        });
        expect(res.status).toBe(401);
      },
    });
  });

  it("404 если запись не найдена", async () => {
    prisma.auto_payment.findMany.mockResolvedValueOnce([]);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ doc_id: 1 }),
        });
        expect(res.status).toBe(404);
      },
    });
  });

  it("200 обновляет запись", async () => {
    prisma.auto_payment.findMany.mockResolvedValueOnce([{ id: 1, pay_sum: 10 }]);
    prisma.documents.findUnique.mockResolvedValueOnce({
      purpose_of_payment: "test",
      account_number: "acc",
      date: new Date("2020-01-01"),
      vat_type: false,
      vat_percent: 0,
      is_auto_purpose_of_payment: true,
    });
    prisma.auto_payment.update.mockResolvedValueOnce({});

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ doc_id: 1 }),
        });
        expect(res.status).toBe(200);
        expect(prisma.auto_payment.update).toHaveBeenCalled();
      },
    });
  });
});
