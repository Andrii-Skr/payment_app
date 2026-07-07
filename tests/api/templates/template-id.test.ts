import * as handler from "@api/templates/[id]/route";
import { testApiHandler } from "next-test-api-route-handler";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    template: { findMany: jest.fn(), update: jest.fn() },
    users_entities: { count: jest.fn() },
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

describe("/templates/[id]", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 GET без сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      params: { id: "1" },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(401);
      },
    });
  });

  it("200 GET возвращает список", async () => {
    prisma.template.findMany.mockResolvedValueOnce([]);

    await testApiHandler({
      appHandler: handler,
      params: { id: "1" },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "GET" });
        expect(res.status).toBe(200);
      },
    });
  });

  it("PATCH сохраняет is_auto_purpose_of_payment=false без подмены на true", async () => {
    prisma.template.update.mockResolvedValueOnce({ id: 1, is_auto_purpose_of_payment: false });

    await testApiHandler({
      appHandler: handler,
      params: { id: "1" },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            entity_id: 1,
            sample: "Sample",
            partner_id: 2,
            full_name: "Partner Full",
            short_name: "PF",
            edrpou: "12345678",
            accountNumber: "INV-1",
            vatPercent: 20,
            vatType: true,
            date: "2026-07-07",
            accountSum: 100,
            accountSumExpression: "",
            partner_account_number_id: 3,
            purposeOfPayment: "Test purpose",
            note: "Test note",
            is_auto_purpose_of_payment: false,
          }),
        });

        expect(res.status).toBe(200);
      },
    });

    expect(prisma.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          is_auto_purpose_of_payment: false,
        }),
      }),
    );
  });
});
