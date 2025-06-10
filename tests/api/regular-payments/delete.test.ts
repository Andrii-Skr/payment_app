import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@api/regular-payments/delete/route";
import { Roles } from "@/constants/roles";

jest.mock("@/prisma/prisma-client", () => ({
  __esModule: true,
  default: {
    auto_payment: { findUnique: jest.fn(), update: jest.fn() },
    documents: { update: jest.fn() },
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

describe("PATCH /regular-payments/delete", () => {
  afterAll(async () => prisma.$disconnect?.());
  beforeEach(() => jest.clearAllMocks());

  it("401 если нет сессии", async () => {
    getServerSession.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: 1 }) });
        expect(res.status).toBe(401);
      },
    });
  });

  it("404 если запись не найдена", async () => {
    prisma.auto_payment.findUnique.mockResolvedValueOnce(null);

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: 1 }) });
        expect(res.status).toBe(404);
      },
    });
  });
});
